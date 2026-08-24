import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = await req.json();
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : "/";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : "";
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
    const duration = typeof body.duration === "number" ? Math.max(0, Math.round(body.duration)) : 0;

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "missing sessionId" }, { status: 400 });
    }

    await prisma.userPageVisit.create({
      data: {
        userId: session.sub,
        sessionId,
        path,
        referrer: referrer ?? undefined,
        duration,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
