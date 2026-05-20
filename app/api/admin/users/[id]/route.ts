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
  })
  .refine((data) => data.role !== undefined || data.password !== undefined, {
    message: "Provide role and/or password to update",
  });

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
      select: { id: true, email: true, role: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: { role?: UserRole; password?: string } = {};

    if (parsed.role !== undefined) {
      if (ELEVATED.includes(parsed.role as (typeof ELEVATED)[number]) && actor.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Only Super Admin can assign Admin or Super Admin roles" },
          { status: 403 }
        );
      }

      const actorId = await resolveUserId(actor);
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

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, username: true, role: true },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);

    return NextResponse.json({
      ok: true,
      user,
      message: passwordMessage,
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
