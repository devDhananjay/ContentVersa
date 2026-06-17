import { NextResponse } from "next/server";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getFollowStatus, getPublicFollowCounts, toggleFollow } from "@/lib/data/follow";
import { isDatabaseConfigured } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/users/:username/follow — follow state + counts */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await ctx.params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        following: false,
        followerCount: 0,
        followingCount: 0,
        database: false,
      });
    }

    const session = await getCurrentUser();
    const followerId = session ? await resolveUserId(session) : null;

    if (!followerId) {
      const pub = await getPublicFollowCounts(username);
      if (!pub.targetUserId) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({
        following: false,
        followerCount: pub.followerCount,
        followingCount: pub.followingCount,
        signedIn: false,
      });
    }

    const status = await getFollowStatus(followerId, username);
    if (!status.targetUserId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      following: status.following,
      followerCount: status.followerCount,
      followingCount: status.followingCount,
      signedIn: true,
      isSelf: followerId === status.targetUserId,
    });
  } catch (err) {
    console.error("[follow GET]", err);
    return NextResponse.json({ error: "Failed to load follow status" }, { status: 500 });
  }
}

/** POST /api/users/:username/follow — toggle follow */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ username: string }> }
) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { username } = await ctx.params;
    const session = await requireUser();
    const followerId = await resolveUserId(session);
    if (!followerId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await toggleFollow(followerId, username);
    if (result.error) {
      const code =
        result.error === "User not found"
          ? 404
          : result.error === "Cannot follow yourself"
            ? 400
            : 503;
      return NextResponse.json({ error: result.error }, { status: code });
    }

    return NextResponse.json({
      ok: true,
      following: result.following,
      followerCount: result.followerCount,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in to follow" }, { status: 401 });
    }
    console.error("[follow POST]", err);
    return NextResponse.json({ error: "Failed to update follow" }, { status: 500 });
  }
}
