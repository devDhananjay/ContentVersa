import { NextResponse } from "next/server";
import { getCurrentUser, clearSessionCookie } from "@/lib/auth";
import { refreshSessionIfStale } from "@/lib/auth/refresh-session";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getUserReadingStats } from "@/lib/data/reading-history";
import { resolveSessionRole } from "@/lib/auth/resolve-session-role";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
};

export async function GET() {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ user: null }, { headers: NO_STORE });
  }

  const user = isDatabaseConfigured() ? await refreshSessionIfStale(current) : current;
  const userId = isDatabaseConfigured() ? await resolveUserId(user) : null;

  let canWriteBlogs = true;
  let aiBlogPermission: "NONE" | "REQUESTED" | "GRANTED" | "DENIED" = "NONE";
  let canUseAiBlog = false;

  if (isDatabaseConfigured() && userId) {
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        banned: true,
        role: true,
        canWriteBlogs: true,
        aiBlogPermission: true,
      },
    });
    if (row?.banned) {
      await clearSessionCookie();
      return NextResponse.json(
        { user: null, error: "account_inactive" },
        { status: 403, headers: NO_STORE }
      );
    }
    if (row) {
      const { computeCanUseAiBlog } = await import("@/lib/auth/blog-permissions");
      canWriteBlogs = row.canWriteBlogs;
      aiBlogPermission = row.aiBlogPermission;
      canUseAiBlog = computeCanUseAiBlog(row.role, row.aiBlogPermission);
    }
  } else {
    const { roleHasDefaultAiBlogAccess } = await import("@/lib/auth/blog-permissions");
    canUseAiBlog = roleHasDefaultAiBlogAccess(current.role);
    if (canUseAiBlog) aiBlogPermission = "GRANTED";
  }

  let profile: {
    bio: string | null;
    headline: string | null;
    website: string | null;
    twitter: string | null;
    isVerified: boolean;
    totalViews: number;
    totalLikes: number;
  } | null = null;

  let wallet: { payoutEmail: string | null; currency: string } | null = null;

  const role = isDatabaseConfigured()
    ? await resolveSessionRole(user)
    : user.role;

  if (isDatabaseConfigured() && userId) {
    profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        bio: true,
        headline: true,
        website: true,
        twitter: true,
        isVerified: true,
        totalViews: true,
        totalLikes: true,
      },
    });
    wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { payoutEmail: true, currency: true },
    });
  }

  let reading: {
    totalSeconds: number;
    totalFormatted: string;
    articlesRead: number;
  } | null = null;

  if (userId) {
    const stats = await getUserReadingStats(userId);
    reading = {
      totalSeconds: stats.totalSeconds,
      totalFormatted: formatDuration(stats.totalSeconds),
      articlesRead: stats.articlesRead,
    };
  }

  return NextResponse.json(
    {
      user: {
        ...user,
        role,
        profile,
        reading,
        payoutEmail: wallet?.payoutEmail ?? null,
        currency: wallet?.currency ?? "INR",
        canWriteBlogs,
        aiBlogPermission,
        canUseAiBlog,
      },
    },
    { headers: NO_STORE }
  );
}
