import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export async function getUserIdByUsername(username: string): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function getFollowStatus(
  followerId: string,
  followingUsername: string
): Promise<{
  following: boolean;
  followerCount: number;
  followingCount: number;
  targetUserId: string | null;
}> {
  if (!isDatabaseConfigured()) {
    return {
      following: false,
      followerCount: 0,
      followingCount: 0,
      targetUserId: null,
    };
  }

  const target = await prisma.user.findUnique({
    where: { username: followingUsername },
    select: { id: true },
  });
  if (!target) {
    return {
      following: false,
      followerCount: 0,
      followingCount: 0,
      targetUserId: null,
    };
  }

  const [following, followerCount, followingCount] = await Promise.all([
    prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: target.id,
        },
      },
    }),
    prisma.follower.count({ where: { followingId: target.id } }),
    prisma.follower.count({ where: { followerId: target.id } }),
  ]);

  return {
    following: Boolean(following),
    followerCount,
    followingCount,
    targetUserId: target.id,
  };
}

export async function toggleFollow(
  followerId: string,
  followingUsername: string
): Promise<{
  following: boolean;
  followerCount: number;
  error?: string;
}> {
  if (!isDatabaseConfigured()) {
    return { following: false, followerCount: 0, error: "Database not configured" };
  }

  const target = await prisma.user.findUnique({
    where: { username: followingUsername },
    select: { id: true, username: true, name: true },
  });
  if (!target) {
    return { following: false, followerCount: 0, error: "User not found" };
  }
  if (target.id === followerId) {
    return { following: false, followerCount: 0, error: "Cannot follow yourself" };
  }

  const existing = await prisma.follower.findUnique({
    where: {
      followerId_followingId: { followerId, followingId: target.id },
    },
  });

  if (existing) {
    await prisma.follower.delete({ where: { id: existing.id } });
    const followerCount = await prisma.follower.count({
      where: { followingId: target.id },
    });
    return { following: false, followerCount };
  }

  const follower = await prisma.user.findUnique({
    where: { id: followerId },
    select: { name: true, username: true },
  });

  await prisma.$transaction([
    prisma.follower.create({
      data: { followerId, followingId: target.id },
    }),
    prisma.notification.create({
      data: {
        userId: target.id,
        type: NotificationType.FOLLOW,
        title: "New follower",
        message: `${follower?.name || follower?.username || "Someone"} started following you.`,
        link: follower?.username ? `/profile/${follower.username}` : "/dashboard",
      },
    }),
  ]);

  const followerCount = await prisma.follower.count({
    where: { followingId: target.id },
  });
  return { following: true, followerCount };
}

export async function getFollowerCount(userId: string): Promise<number> {
  if (!isDatabaseConfigured()) return 0;
  return prisma.follower.count({ where: { followingId: userId } });
}

export async function getPublicFollowCounts(username: string) {
  if (!isDatabaseConfigured()) {
    return { targetUserId: null, followerCount: 0, followingCount: 0 };
  }
  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!target) {
    return { targetUserId: null, followerCount: 0, followingCount: 0 };
  }
  const [followerCount, followingCount] = await Promise.all([
    prisma.follower.count({ where: { followingId: target.id } }),
    prisma.follower.count({ where: { followerId: target.id } }),
  ]);
  return { targetUserId: target.id, followerCount, followingCount };
}
