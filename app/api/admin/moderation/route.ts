import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { mapDbBlogToBlog } from "@/lib/data/blog-db";

const Schema = z.object({
  blogId: z.string(),
  decision: z.enum(["APPROVED", "REJECTED", "REQUEST_CHANGES"]),
  feedback: z.string().optional(),
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

    return NextResponse.json({
      pending: pending.map((b) => ({ ...mapDbBlogToBlog(b), status: b.status, blogId: b.id })),
      flagged: flagged.map((b) => ({ ...mapDbBlogToBlog(b), status: b.status, blogId: b.id })),
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
    const { blogId, decision, feedback } = Schema.parse(body);

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: { submission: true, author: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (decision === "APPROVED") {
      await prisma.$transaction([
        prisma.blog.update({
          where: { id: blogId },
          data: {
            status: "PUBLISHED",
            publishedAt: new Date(),
            rejectionNote: null,
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
        prisma.notification.create({
          data: {
            userId: blog.authorId,
            type: "APPROVAL",
            title: "Your blog was approved",
            message: `“${blog.title}” is now live on ContentVerse.`,
            link: `/blog/${blog.slug}`,
          },
        }),
      ]);
    } else if (decision === "REJECTED") {
      await prisma.$transaction([
        prisma.blog.update({
          where: { id: blogId },
          data: {
            status: "REJECTED",
            rejectionNote: feedback ?? "Please revise and resubmit.",
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
