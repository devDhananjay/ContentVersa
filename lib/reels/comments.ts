import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { mapUserToAuthor } from "@/lib/data/blog-db";

export type ReelCommentDto = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
};

export async function getReelComments(
  reelId: string,
  limit = 50
): Promise<ReelCommentDto[]> {
  if (!isDatabaseConfigured()) return [];

  const rows = await prisma.reelComment.findMany({
    where: { reelId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { include: { profile: true } } },
  });

  return rows.map((c) => {
    const author = mapUserToAuthor(c.user);
    return {
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: {
        id: author.id,
        name: author.name,
        username: author.username,
        avatar: author.avatar,
      },
    };
  });
}

export async function createReelComment(input: {
  reelId: string;
  userId: string;
  content: string;
}): Promise<ReelCommentDto> {
  const row = await prisma.$transaction(async (tx) => {
    const comment = await tx.reelComment.create({
      data: {
        reelId: input.reelId,
        userId: input.userId,
        content: input.content,
      },
      include: { user: { include: { profile: true } } },
    });
    await tx.reel.update({
      where: { id: input.reelId },
      data: { commentsCount: { increment: 1 } },
    });
    return comment;
  });

  const author = mapUserToAuthor(row.user);
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    author: {
      id: author.id,
      name: author.name,
      username: author.username,
      avatar: author.avatar,
    },
  };
}
