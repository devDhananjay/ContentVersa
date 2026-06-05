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
  parentId?: string | null
) {
  if (!isDatabaseConfigured()) return;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { authorId: true, slug: true, title: true },
  });
  if (!blog || blog.authorId === actorUserId) return;

  const actor = await getActorName(actorUserId);
  const isReply = Boolean(parentId);

  await createUserNotification({
    userId: blog.authorId,
    type: NotificationType.COMMENT,
    title: isReply ? "New reply on your article" : "New comment on your article",
    message: `${actor} ${isReply ? "replied on" : "commented on"} “${blog.title}”.`,
    link: `/blog/${blog.slug}#comments`,
  });
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
