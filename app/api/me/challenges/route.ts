import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { checkWeeklyAiReadingChallenge } from "@/lib/engagement/challenges";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const challenge = await checkWeeklyAiReadingChallenge(userId);
    return NextResponse.json(challenge);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
