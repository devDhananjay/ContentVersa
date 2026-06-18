import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import {
  ensureReferralCode,
  referralSignupUrl,
} from "@/lib/referral";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireUser();
    const userId = await requireUserId(session);
    const code = await ensureReferralCode(userId);
    if (!code) {
      return NextResponse.json({ error: "Referral unavailable" }, { status: 503 });
    }
    return NextResponse.json({
      code,
      url: referralSignupUrl(code),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
