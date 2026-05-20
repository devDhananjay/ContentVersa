import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

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

  return NextResponse.json(
    { user: { ...user, profile } },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
