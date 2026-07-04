import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { dispatchBlogPublishedNotifications } from "@/lib/notifications/blog-published";
import { revalidatePath } from "next/cache";

/**
 * Publish blogs whose scheduledFor time has arrived.
 * Only DRAFT (or REJECTED re-scheduled) posts with a due scheduledFor go live.
 */
export async function publishDueScheduledBlogs(limit = 50) {
  if (!isDatabaseConfigured()) {
    return { published: 0, ids: [] as string[] };
  }

  const now = new Date();
  const due = await prisma.blog.findMany({
    where: {
      scheduledFor: { lte: now },
      status: { in: [BlogStatus.DRAFT, BlogStatus.PENDING] },
    },
    select: { id: true, slug: true, authorId: true },
    orderBy: { scheduledFor: "asc" },
    take: limit,
  });

  const ids: string[] = [];

  for (const row of due) {
    await prisma.blog.update({
      where: { id: row.id },
      data: {
        status: BlogStatus.PUBLISHED,
        publishedAt: now,
        scheduledFor: null,
      },
    });
    ids.push(row.id);
    await dispatchBlogPublishedNotifications(row.id).catch(() => {});
    revalidatePath(`/blog/${row.slug}`);
  }

  if (ids.length) {
    revalidatePath("/");
    revalidatePath("/blogs");
    revalidatePath("/sitemap.xml");
    revalidatePath("/dashboard/blogs");
    revalidatePath("/admin/blogs");
  }

  return { published: ids.length, ids };
}
