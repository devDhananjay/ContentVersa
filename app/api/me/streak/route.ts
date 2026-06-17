import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getUserStreakState } from "@/lib/engagement/streak";

export const dynamic = "force-dynamic";

/** GET /api/me/streak — current reading streak + 7-day calendar */
export async function GET() {
  try {
    const session = await requireUser();
    const userId = await resolveUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const streak = await getUserStreakState(userId);
    if (!streak) {
      return NextResponse.json({ error: "Streak unavailable" }, { status: 503 });
    }

    return NextResponse.json({ ok: true, ...streak });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[me streak]", err);
    return NextResponse.json({ error: "Failed to load streak" }, { status: 500 });
  }
}
