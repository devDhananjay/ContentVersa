import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { HUID_FREE_LIMIT, getHuidQuotaStatus } from "@/lib/goldverse/quota";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      used: 0,
      limit: HUID_FREE_LIMIT,
      bonusCredits: 0,
      remaining: HUID_FREE_LIMIT,
      canVerify: false,
      loggedIn: false,
    });
  }

  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({
      used: 0,
      limit: HUID_FREE_LIMIT,
      bonusCredits: 0,
      remaining: 0,
      canVerify: false,
      loggedIn: false,
    });
  }

  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({
      used: 0,
      limit: HUID_FREE_LIMIT,
      bonusCredits: 0,
      remaining: 0,
      canVerify: false,
      loggedIn: false,
    });
  }

  const status = await getHuidQuotaStatus(userId);
  return NextResponse.json({ ...status, loggedIn: true });
}
