import { NextResponse } from "next/server";
import { BlogStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { dispatchBlogPublishedNotifications } from "@/lib/notifications/blog-published";

/** POST /api/admin/blogs/[id]/publish — publish a draft AI article after admin preview */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { id } = await ctx.params;
    const existing = await prisma.blog.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (existing.status === BlogStatus.PUBLISHED) {
      return NextResponse.json({
        ok: true,
        blog: existing,
        message: "Already published",
      });
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        status: BlogStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      select: { id: true, slug: true, title: true, readingTime: true, status: true },
    });

    void dispatchBlogPublishedNotifications(blog.id);
    revalidatePath("/");
    revalidatePath("/blogs");
    revalidatePath(`/blog/${blog.slug}`);
    revalidatePath("/admin/blogs");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ ok: true, blog });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin blog publish]", err);
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }
}
