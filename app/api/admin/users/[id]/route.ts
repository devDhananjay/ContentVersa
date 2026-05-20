import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { resolveUserId } from "@/lib/auth/resolve-user-id";

const PatchSchema = z.object({
  role: z.enum(["USER", "VERIFIED_CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
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
    const { role } = PatchSchema.parse(body);

    if (ELEVATED.includes(role as (typeof ELEVATED)[number]) && actor.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only Super Admin can assign Admin or Super Admin roles" },
        { status: 403 }
      );
    }

    const actorId = await resolveUserId(actor);
    if (actorId === id && role !== "SUPER_ADMIN" && actor.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "You cannot demote your own Super Admin account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: role as UserRole },
      select: { id: true, email: true, username: true, role: true },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
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
