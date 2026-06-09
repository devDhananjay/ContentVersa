import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export async function getReelLikeState(reelId: string, userId?: string | null) {
  if (!isDatabaseConfigured()) {
    return { likesCount: 0, likedByMe: false };
  }
  if (!userId) {
    const reel = await prisma.reel.findUnique({
      where: { id: reelId },
      select: { likesCount: true },
    });
    return { likesCount: reel?.likesCount ?? 0, likedByMe: false };
  }

  const [reel, like] = await Promise.all([
    prisma.reel.findUnique({ where: { id: reelId }, select: { likesCount: true } }),
    prisma.reelLike.findUnique({
      where: { reelId_userId: { reelId, userId } },
    }),
  ]);

  return {
    likesCount: reel?.likesCount ?? 0,
    likedByMe: Boolean(like),
  };
}

export async function toggleReelLike(reelId: string, userId: string) {
  const existing = await prisma.reelLike.findUnique({
    where: { reelId_userId: { reelId, userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.reelLike.delete({ where: { id: existing.id } }),
      prisma.reel.update({
        where: { id: reelId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
    const reel = await prisma.reel.findUnique({
      where: { id: reelId },
      select: { likesCount: true },
    });
    return { likedByMe: false, likesCount: reel?.likesCount ?? 0 };
  }

  await prisma.$transaction([
    prisma.reelLike.create({ data: { reelId, userId } }),
    prisma.reel.update({
      where: { id: reelId },
      data: { likesCount: { increment: 1 } },
    }),
  ]);
  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
    select: { likesCount: true },
  });
  return { likedByMe: true, likesCount: reel?.likesCount ?? 0 };
}
