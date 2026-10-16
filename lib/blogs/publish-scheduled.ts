import { BlogStatus } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { dispatchBlogPublishedNotifications } from "@/lib/notifications/blog-published";
import {
  isAiFreePublishError,
  prepareAiFreePublishFields,
} from "@/lib/seo/ai-free-content";
import { readingTime } from "@/lib/utils";
import { revalidatePath } from "next/cache";

/**
 * Publish blogs whose scheduledFor time has arrived.
 * Only DRAFT (or REJECTED re-scheduled) posts with a due scheduledFor go live.
 * Every post must pass the mandatory AI-free cleanup gate first.
 */
export async function publishDueScheduledBlogs(limit = 50) {
  if (!isDatabaseConfigured()) {
    return { published: 0, blocked: 0, ids: [] as string[] };
  }

  const now = new Date();
  const due = await prisma.blog.findMany({
    where: {
      scheduledFor: { lte: now },
      status: { in: [BlogStatus.DRAFT, BlogStatus.PENDING] },
    },
    select: {
      id: true,
      slug: true,
      authorId: true,
      title: true,
      excerpt: true,
      content: true,
      metaDescription: true,
    },
    orderBy: { scheduledFor: "asc" },
    take: limit,
  });

  const ids: string[] = [];
  let blocked = 0;

  for (const row of due) {
    let cleaned;
    try {
      cleaned = prepareAiFreePublishFields({
        title: row.title,
        excerpt: row.excerpt,
        content: row.content,
        metaDescription: row.metaDescription,
      });
    } catch (err) {
      blocked++;
      if (isAiFreePublishError(err)) {
        console.warn(
          `[publish-scheduled] AI-free blocked ${row.slug}: ${err.hits.join(", ")}`
        );
      }
      continue;
    }

    await prisma.blog.update({
      where: { id: row.id },
      data: {
        title: cleaned.title,
        excerpt: cleaned.excerpt,
        content: cleaned.content,
        metaDescription: cleaned.metaDescription,
        readingTime: readingTime(cleaned.content),
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

  return { published: ids.length, blocked, ids };
}
