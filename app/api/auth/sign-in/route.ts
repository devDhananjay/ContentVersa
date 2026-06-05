import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";

const Schema = z.object({
  email: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: identifier, password } = Schema.parse(body);
    const normalized = identifier.trim().toLowerCase();

    // Lookup user (gracefully degrades when DB is unreachable, returns demo mode)
    let user: { id: string; email: string; name: string | null; username: string; password: string | null; role: string; image: string | null } | null = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ email: normalized }, { username: normalized }],
        },
      });
    } catch {
      // demo mode: accept any credentials
      const data = await signSession({
        sub: "demo",
        email: normalized.includes("@") ? normalized : `${normalized}@demo.local`,
        username: normalized.includes("@") ? normalized.split("@")[0] : normalized,
        role: "USER",
        name: normalized.includes("@") ? normalized.split("@")[0] : normalized,
      });
      await setSessionCookie(data);
      return NextResponse.json({ ok: true, demo: true });
    }

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signSession({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role as
        | "USER"
        | "ADMIN"
        | "MODERATOR"
        | "VERIFIED_CREATOR"
        | "SUPER_ADMIN"
        | "GUEST",
      name: user.name || undefined,
      image: user.image || undefined,
    });
    await setSessionCookie(token);
    return NextResponse.json({ ok: true, role: user.role });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Sign in failed" }, { status: 500 });
  }
}
