import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { mapUserToAuthor } from "@/lib/data/blog-db";
import { notifyBlogAuthorOnComment } from "@/lib/notifications/blog-engagement";

export type CommentDto = {
  id: string;
  content: string;
  createdAt: string;
  likes: number;
  likedByMe: boolean;
  parentId: string | null;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  replies: CommentDto[];
};

type CommentRow = {
  id: string;
  content: string;
  createdAt: Date;
  likes: number;
  parentId: string | null;
  user: Parameters<typeof mapUserToAuthor>[0] & { profile?: { bio: string | null } | null };
  likedBy: { userId: string }[];
  replies?: CommentRow[];
};

export async function getCommentsForBlog(
  blogId: string,
  viewerUserId?: string | null
): Promise<CommentDto[]> {
  if (!isDatabaseConfigured()) return [];

  const rows = await prisma.comment.findMany({
    where: { blogId, isHidden: false, parentId: null },
    include: {
      user: { include: { profile: true } },
      likedBy: true,
      replies: {
        where: { isHidden: false },
        orderBy: { createdAt: "asc" },
        include: {
          user: { include: { profile: true } },
          likedBy: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((c) => mapComment(c as CommentRow, viewerUserId));
}

function mapComment(c: CommentRow, viewerUserId?: string | null): CommentDto {
  const author = mapUserToAuthor(c.user);
  const likedByMe = Boolean(
    viewerUserId && c.likedBy.some((l) => l.userId === viewerUserId)
  );

  return {
    id: c.id,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    likes: c.likes,
    likedByMe,
    parentId: c.parentId,
    author: {
      id: author.id,
      name: author.name,
      username: author.username,
      avatar: author.avatar,
    },
    replies: (c.replies || []).map((r) => mapComment(r, viewerUserId)),
  };
}

export async function createComment(input: {
  blogId: string;
  userId: string;
  content: string;
  parentId?: string;
}) {
  const comment = await prisma.comment.create({
    data: {
      blogId: input.blogId,
      userId: input.userId,
      content: input.content.trim(),
      parentId: input.parentId || null,
    },
    include: {
      user: { include: { profile: true } },
      likedBy: true,
    },
  });

  if (!input.parentId) {
    await prisma.blog.update({
      where: { id: input.blogId },
      data: { commentsCount: { increment: 1 } },
    });
  }

  void notifyBlogAuthorOnComment(
    input.blogId,
    input.userId,
    input.parentId ?? null
  );

  return mapComment(comment as CommentRow, input.userId);
}

export async function toggleCommentLike(commentId: string, userId: string) {
  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId, userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.commentLike.delete({ where: { id: existing.id } }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likes: { decrement: 1 } },
      }),
    ]);
    return { liked: false };
  }

  await prisma.$transaction([
    prisma.commentLike.create({ data: { commentId, userId } }),
    prisma.comment.update({
      where: { id: commentId },
      data: { likes: { increment: 1 } },
    }),
  ]);
  return { liked: true };
}
