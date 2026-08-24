import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { mapDbBlogToBlog } from "@/lib/data/blog-db";
import { dispatchBlogPublishedNotifications } from "@/lib/notifications/blog-published";
import { isAdEligibleByQuality } from "@/lib/seo/crawl-policy";
import { defaultAdEligibleOnApprove } from "@/lib/seo/creator-quality";
import { getCreatorQualityForUser } from "@/lib/seo/creator-quality-db";

const Schema = z.object({
  blogId: z.string(),
  decision: z.enum(["APPROVED", "REJECTED", "REQUEST_CHANGES"]),
  feedback: z.string().optional(),
  /** Optional override when approving; default = quality gate. */
  adEligible: z.boolean().optional(),
});

const AdEligibleSchema = z.object({
  blogId: z.string(),
  adEligible: z.boolean(),
});

const blogInclude = {
  author: { include: { profile: true } },
  category: true,
  submission: true,
} as const;

export async function GET() {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ data: [] });
    }

    const pending = await prisma.blog.findMany({
      where: { status: "PENDING" },
      include: blogInclude,
      orderBy: { createdAt: "desc" },
    });

    const flagged = await prisma.blog.findMany({
      where: { status: "REJECTED" },
      include: blogInclude,
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    const authorIds = [
      ...new Set([...pending, ...flagged].map((b) => b.authorId)),
    ];
    const qualityEntries = await Promise.all(
      authorIds.map(async (id) => [id, await getCreatorQualityForUser(id)] as const)
    );
    const creatorQualityByAuthor = Object.fromEntries(qualityEntries);

    const mapItem = (b: (typeof pending)[number]) => ({
      ...mapDbBlogToBlog(b),
      status: b.status,
      blogId: b.id,
      adEligible: b.adEligible,
      authorId: b.authorId,
      creatorQuality: creatorQualityByAuthor[b.authorId] ?? null,
    });

    return NextResponse.json({
      pending: pending.map(mapItem),
      flagged: flagged.map(mapItem),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load queue" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const reviewer = await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const reviewerId = await requireUserId(reviewer);
    const body = await req.json();
    const { blogId, decision, feedback, adEligible } = Schema.parse(body);

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: { submission: true, author: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (decision === "APPROVED") {
      const qualityOk = isAdEligibleByQuality({
        slug: blog.slug,
        readingTime: blog.readingTime,
      });
      const creator = await getCreatorQualityForUser(blog.authorId);
      const qualify = defaultAdEligibleOnApprove({
        qualityOk,
        creator,
        moderatorOverride: adEligible,
      });
      await prisma.$transaction([
        prisma.blog.update({
          where: { id: blogId },
          data: {
            status: "PUBLISHED",
            publishedAt: new Date(),
            rejectionNote: null,
            adEligible: qualify,
          },
        }),
        prisma.submissionQueue.updateMany({
          where: { blogId },
          data: {
            decision: "APPROVED",
            reviewerId,
            reviewedAt: new Date(),
            feedback: feedback ?? null,
          },
        }),
      ]);
      void dispatchBlogPublishedNotifications(blogId);
    } else if (decision === "REJECTED") {
      await prisma.$transaction([
        prisma.blog.update({
          where: { id: blogId },
          data: {
            status: "REJECTED",
            rejectionNote: feedback ?? "Please revise and resubmit.",
            adEligible: false,
          },
        }),
        prisma.submissionQueue.updateMany({
          where: { blogId },
          data: {
            decision: "REJECTED",
            reviewerId,
            reviewedAt: new Date(),
            feedback: feedback ?? null,
          },
        }),
        prisma.notification.create({
          data: {
            userId: blog.authorId,
            type: "REJECTION",
            title: "Submission needs changes",
            message: feedback || `“${blog.title}” was not approved. Check feedback in My Blogs.`,
            link: "/dashboard/blogs",
          },
        }),
      ]);
    } else {
      await prisma.submissionQueue.updateMany({
        where: { blogId },
        data: {
          decision: "REQUEST_CHANGES",
          reviewerId,
          reviewedAt: new Date(),
          feedback: feedback ?? null,
        },
      });
      await prisma.notification.create({
        data: {
          userId: blog.authorId,
          type: "SYSTEM",
          title: "Changes requested",
          message: feedback || `Please update “${blog.title}” and submit again.`,
          link: "/dashboard/blogs",
        },
      });
    }

    revalidatePath("/admin/moderation");
    revalidatePath("/dashboard/blogs");
    revalidatePath("/");
    revalidatePath("/blogs");

    return NextResponse.json({ ok: true, blogId, decision });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[moderation POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

/** Toggle adEligible on a published (or any) blog after quality review.
 * Thin / syndicated posts cannot be forced on.
 */
export async function PATCH(req: Request) {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { blogId, adEligible } = AdEligibleSchema.parse(await req.json());
    const existing = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true, slug: true, readingTime: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const allowed =
      adEligible &&
      isAdEligibleByQuality({
        slug: existing.slug,
        readingTime: existing.readingTime,
      });

    const updated = await prisma.blog.update({
      where: { id: blogId },
      data: { adEligible: allowed },
      select: { id: true, slug: true, adEligible: true, status: true },
    });

    revalidatePath("/admin/moderation");
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath("/blogs");

    return NextResponse.json({
      ok: true,
      ...updated,
      ...(adEligible && !allowed
        ? { warning: "Quality gate blocked ads for this post" }
        : {}),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[moderation PATCH]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
