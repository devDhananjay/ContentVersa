import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireSuperAdminApi } from "@/lib/auth/require-admin-api";

const Schema = z.object({
  email: z.string().email(),
  role: z.enum(["USER", "VERIFIED_CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
});

/**
 * Promote / change role by email.
 * Auth: Super Admin session OR header x-admin-bootstrap-secret (set ADMIN_BOOTSTRAP_SECRET on server).
 *
 * POST /api/admin/users/promote
 * { "email": "user@example.com", "role": "SUPER_ADMIN" }
 */
export async function POST(req: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET?.trim();
    const headerSecret = req.headers.get("x-admin-bootstrap-secret")?.trim();
    const bootstrapOk =
      Boolean(bootstrapSecret && headerSecret && bootstrapSecret === headerSecret);

    if (!bootstrapOk) {
      await requireSuperAdminApi();
    }

    const body = await req.json();
    const { email, role } = Schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, username: true, role: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: `User ${email} not found. Sign in with Google once, then retry.` },
        { status: 404 }
      );
    }

    const user = await prisma.user.update({
      where: { id: existing.id },
      data: { role: role as UserRole },
      select: { id: true, email: true, username: true, name: true, role: true },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${user.id}`);

    return NextResponse.json({
      ok: true,
      user,
      message: `${user.email} is now ${user.role}. Sign out and sign in again to refresh session.`,
      via: bootstrapOk ? "bootstrap" : "super_admin",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: err.flatten() }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden — Super Admin required" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        {
          error: "Sign in as Super Admin, or send x-admin-bootstrap-secret header",
        },
        { status: 401 }
      );
    }
    console.error("[admin users promote]", err);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
