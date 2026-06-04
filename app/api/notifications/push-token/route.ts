import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

const Schema = z.object({
  token: z.string().min(20).max(512),
});

export async function POST(req: Request) {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true, demo: true });
    }

    const { token } = Schema.parse(await req.json());

    await prisma.pushToken.upsert({
      where: { token },
      create: { userId, token },
      update: { userId, updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[push-token]", err);
    return NextResponse.json({ error: "Failed to save token" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = Schema.safeParse(body);
    if (parsed.success) {
      await prisma.pushToken.deleteMany({
        where: { userId, token: parsed.data.token },
      });
    } else {
      await prisma.pushToken.deleteMany({ where: { userId } });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
