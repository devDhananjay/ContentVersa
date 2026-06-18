import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";

const Schema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  ref: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, password, ref } = Schema.parse(body);

    try {
      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Email or username already taken" },
          { status: 409 }
        );
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          name,
          username,
          password: passwordHash,
          profile: { create: {} },
          wallet: { create: {} },
        },
      });
      const { applyReferralOnSignup } = await import("@/lib/referral");
      void applyReferralOnSignup(user.id, ref);
      const token = await signSession({
        sub: user.id,
        email: user.email,
        username: user.username,
        role: "USER",
        name: user.name || undefined,
      });
      await setSessionCookie(token);
      return NextResponse.json({ ok: true });
    } catch {
      // demo mode (no DB) — still sign user in
      const token = await signSession({
        sub: "demo",
        email,
        username,
        role: "USER",
        name,
      });
      await setSessionCookie(token);
      return NextResponse.json({ ok: true, demo: true });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Sign up failed" }, { status: 500 });
  }
}
