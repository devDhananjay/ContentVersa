import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { requireAdminApi, requireSuperAdminApi } from "@/lib/auth/require-admin-api";

const ASSIGNABLE_BY_ADMIN = ["USER", "VERIFIED_CREATOR", "MODERATOR"] as const;

const ASSIGNABLE_BY_SUPER = [
  "USER",
  "VERIFIED_CREATOR",
  "MODERATOR",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

const CreateSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["USER", "VERIFIED_CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
});

export async function POST(req: Request) {
  try {
    const actor = await requireAdminApi();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await req.json();
    const data = CreateSchema.parse(body);

    const allowed =
      actor.role === "SUPER_ADMIN" ? ASSIGNABLE_BY_SUPER : ASSIGNABLE_BY_ADMIN;

    if (!(allowed as readonly string[]).includes(data.role)) {
      return NextResponse.json(
        { error: "Only Super Admin can assign Admin or Super Admin roles" },
        { status: 403 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) {
      return NextResponse.json({ error: "Email or username already taken" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        username: data.username,
        password: passwordHash,
        role: data.role as UserRole,
        emailVerified: new Date(),
        profile: { create: {} },
        wallet: { create: {} },
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
      },
    });

    revalidatePath("/admin/users");

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: err.flatten() }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin users POST]", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
