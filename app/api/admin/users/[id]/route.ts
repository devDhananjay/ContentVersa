import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireAdminApi, requireSuperAdminApi } from "@/lib/auth/require-admin-api";
import { resolveUserId } from "@/lib/auth/resolve-user-id";

const PatchSchema = z
  .object({
    role: z.enum(["USER", "VERIFIED_CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"]).optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    banned: z.boolean().optional(),
    banReason: z.string().max(300).nullable().optional(),
  })
  .refine(
    (data) =>
      data.role !== undefined ||
      data.password !== undefined ||
      data.banned !== undefined,
    { message: "Provide role, password, and/or banned status to update" }
  );

const ELEVATED = ["ADMIN", "SUPER_ADMIN"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdminApi();
    const { id } = await params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await req.json();
    const parsed = PatchSchema.parse(body);

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, banned: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const actorId = await resolveUserId(actor);
    const wasBanned = target.banned;

    const updateData: {
      role?: UserRole;
      password?: string;
      banned?: boolean;
      banReason?: string | null;
    } = {};

    if (parsed.role !== undefined) {
      if (ELEVATED.includes(parsed.role as (typeof ELEVATED)[number]) && actor.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Only Super Admin can assign Admin or Super Admin roles" },
          { status: 403 }
        );
      }

      if (actorId === id && parsed.role !== "SUPER_ADMIN" && actor.role === "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "You cannot demote your own Super Admin account" },
          { status: 400 }
        );
      }

      updateData.role = parsed.role as UserRole;
    }

    let passwordMessage: string | undefined;
    if (parsed.password !== undefined) {
      await requireSuperAdminApi();
      updateData.password = await bcrypt.hash(parsed.password, 10);
      passwordMessage = `Password updated for ${target.email}. User can sign in with the new password.`;
    }

    if (parsed.banned !== undefined) {
      if (actorId === id) {
        return NextResponse.json(
          { error: "You cannot deactivate your own account" },
          { status: 400 }
        );
      }
      if (
        (target.role === "SUPER_ADMIN" || target.role === "ADMIN") &&
        actor.role !== "SUPER_ADMIN"
      ) {
        return NextResponse.json(
          { error: "Only Super Admin can deactivate Admin accounts" },
          { status: 403 }
        );
      }
      if (target.role === "SUPER_ADMIN" && parsed.banned) {
        return NextResponse.json(
          { error: "Super Admin accounts cannot be deactivated" },
          { status: 400 }
        );
      }

      updateData.banned = parsed.banned;
      if (parsed.banned) {
        const reason = parsed.banReason?.trim();
        updateData.banReason = reason || "Deactivated by admin";
      } else {
        updateData.banReason = null;
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        banned: true,
        banReason: true,
      },
    });

    let emailed = false;
    if (parsed.banned === true && !wasBanned) {
      const { notifyAccountInactive } = await import(
        "@/lib/notifications/account-inactive"
      );
      emailed = await notifyAccountInactive({
        email: user.email,
        name: user.name,
        reason: user.banReason,
      });
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);

    return NextResponse.json({
      ok: true,
      user,
      emailed,
      message:
        passwordMessage ||
        (parsed.banned === true
          ? `${user.email} marked inactive${emailed ? " — email sent" : ""}`
          : parsed.banned === false
            ? `${user.email} reactivated`
            : undefined),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.errors[0];
      return NextResponse.json(
        { error: first?.message || "Invalid input" },
        { status: 400 }
      );
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin users PATCH]", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
