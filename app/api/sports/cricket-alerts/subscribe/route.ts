import { NextResponse } from "next/server";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ subscribed: false, signedIn: false, demo: true });
  }

  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ subscribed: false, signedIn: false });
  }

  const userId = await requireUserId(session).catch(() => null);
  if (!userId) {
    return NextResponse.json({ subscribed: false, signedIn: true });
  }

  const sub = await prisma.cricketAlertSubscription.findUnique({
    where: { userId },
  });

  return NextResponse.json({ subscribed: Boolean(sub), signedIn: true });
}

export async function POST() {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true, subscribed: true, demo: true });
    }

    await prisma.cricketAlertSubscription.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return NextResponse.json({ ok: true, subscribed: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true, subscribed: false });
    }

    await prisma.cricketAlertSubscription.deleteMany({ where: { userId } });

    return NextResponse.json({ ok: true, subscribed: false });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
