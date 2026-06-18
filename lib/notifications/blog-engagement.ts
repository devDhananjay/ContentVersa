import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { createUserNotification } from "@/lib/notifications/create";

async function getActorName(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, username: true },
  });
  return user?.name || user?.username || "Someone";
}

function parseMentions(content: string): string[] {
  const matches = content.match(/@([a-zA-Z0-9_-]{3,30})/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

export async function notifyBlogAuthorOnReaction(
  blogId: string,
  actorUserId: string,
  reactionAdded: boolean
) {
  if (!isDatabaseConfigured() || !reactionAdded) return;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { authorId: true, slug: true, title: true },
  });
  if (!blog || blog.authorId === actorUserId) return;

  const actor = await getActorName(actorUserId);
  await createUserNotification({
    userId: blog.authorId,
    type: NotificationType.LIKE,
    title: "New reaction on your article",
    message: `${actor} reacted to “${blog.title}”.`,
    link: `/blog/${blog.slug}`,
  });
}

export async function notifyBlogAuthorOnComment(
  blogId: string,
  actorUserId: string,
  content: string,
  parentId?: string | null
) {
  if (!isDatabaseConfigured()) return;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { authorId: true, slug: true, title: true },
  });
  if (!blog) return;

  const actor = await getActorName(actorUserId);
  const link = `/blog/${blog.slug}#comments`;
  const isReply = Boolean(parentId);

  if (blog.authorId !== actorUserId) {
    await createUserNotification({
      userId: blog.authorId,
      type: isReply ? NotificationType.REPLY : NotificationType.COMMENT,
      title: isReply ? "New reply on your article" : "New comment on your article",
      message: `${actor} ${isReply ? "replied on" : "commented on"} “${blog.title}”.`,
      link,
    });
  }

  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { userId: true },
    });
    if (parent && parent.userId !== actorUserId && parent.userId !== blog.authorId) {
      await createUserNotification({
        userId: parent.userId,
        type: NotificationType.REPLY,
        title: "Reply to your comment",
        message: `${actor} replied: “${content.slice(0, 120)}${content.length > 120 ? "…" : ""}”`,
        link,
      });
    }
  }

  const mentions = parseMentions(content);
  if (mentions.length === 0) return;

  const mentionedUsers = await prisma.user.findMany({
    where: { username: { in: mentions, mode: "insensitive" } },
    select: { id: true, username: true },
  });

  const notified = new Set([actorUserId, blog.authorId]);
  for (const u of mentionedUsers) {
    if (notified.has(u.id)) continue;
    notified.add(u.id);
    await createUserNotification({
      userId: u.id,
      type: NotificationType.MENTION,
      title: `${actor} mentioned you`,
      message: `On “${blog.title}”: ${content.slice(0, 140)}${content.length > 140 ? "…" : ""}`,
      link,
    });
  }
}

export async function notifyBlogAuthorOnTip(
  blogId: string,
  actorUserId: string,
  amountInr: number
) {
  if (!isDatabaseConfigured()) return;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { authorId: true, slug: true, title: true },
  });
  if (!blog || blog.authorId === actorUserId) return;

  const actor = await getActorName(actorUserId);
  await createUserNotification({
    userId: blog.authorId,
    type: NotificationType.TIP_RECEIVED,
    title: "You received a tip",
    message: `${actor} tipped ₹${amountInr} for “${blog.title}”.`,
    link: `/blog/${blog.slug}`,
  });
}
