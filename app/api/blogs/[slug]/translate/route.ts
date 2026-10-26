import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { isAdminRole } from "@/lib/auth/roles";
import { translateBlogToHindi } from "@/lib/i18n/translate-blog";
import { getBlogPermissionsForSession } from "@/lib/auth/blog-permissions";
import { isAiHiTranslateEnabled } from "@/lib/i18n/policy";

const BodySchema = z.object({
  force: z.boolean().optional(),
});

/**
 * POST — generate / refresh Hindi draft for a blog (author or admin).
 * Uses AI translate; gated like other AI blog tools for non-admins.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireUser();
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    if (!isAiHiTranslateEnabled()) {
      return NextResponse.json(
        {
          error:
            "AI Hindi translate is off (free mode). UI language switch still works. Set ENABLE_AI_HI_TRANSLATE=1 when you want Gemini drafts.",
          code: "AI_HI_DISABLED",
        },
        { status: 503 }
      );
    }

    const { slug } = await params;
    const userId = await requireUserId(session);
    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        authorId: true,
        category: { select: { slug: true } },
      },
    });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const isOwner = blog.authorId === userId;
    const isAdmin = isAdminRole(session.role);
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isAdmin) {
      const perms = await getBlogPermissionsForSession(session);
      if (!perms.canUseAiBlog) {
        return NextResponse.json(
          {
            error: "AI translation requires AI blog permission",
            code: "AI_BLOG_FORBIDDEN",
          },
          { status: 403 }
        );
      }
    }

    await BodySchema.parseAsync(await req.json().catch(() => ({})));

    const result = await translateBlogToHindi({
      blogId: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
      categorySlug: blog.category?.slug,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      status: result.status,
      message:
        result.status === "DRAFT"
          ? "Hindi draft saved — admin approval required before it goes live."
          : "Hindi translation ready (status READY).",
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[translate HI]", err);
    return NextResponse.json({ error: "Translate failed" }, { status: 500 });
  }
}
