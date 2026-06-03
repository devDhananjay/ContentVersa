import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getUserReadingStats } from "@/lib/data/reading-history";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { user: null },
      { headers: { "Cache-Control": "no-store" } }
    );
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

  if (isDatabaseConfigured() && user.sub && !user.sub.includes(":")) {
    profile = await prisma.profile.findUnique({
      where: { userId: user.sub },
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
  }

  let reading: {
    totalSeconds: number;
    totalFormatted: string;
    articlesRead: number;
  } | null = null;

  if (isDatabaseConfigured() && user.sub && !user.sub.includes(":")) {
    const userId = await resolveUserId(user);
    if (userId) {
      const stats = await getUserReadingStats(userId);
      reading = {
        totalSeconds: stats.totalSeconds,
        totalFormatted: formatDuration(stats.totalSeconds),
        articlesRead: stats.articlesRead,
      };
    }
  }

  return NextResponse.json(
    { user: { ...user, profile, reading } },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
