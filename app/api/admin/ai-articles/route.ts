import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { isDatabaseConfigured } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/data/categories";
import { generateSeoArticle } from "@/lib/seo/article-generator";
import { suggestHotTopics } from "@/lib/seo/hot-topics";
import { publishGeneratedArticle } from "@/lib/seo/publish-article";
import { slugify } from "@/lib/utils";
import { dispatchBlogPublishedNotifications } from "@/lib/notifications/blog-published";

const GenerateSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(5),
  searchIntent: z.string().min(5),
  publish: z.boolean().optional().default(true),
});

export async function GET(req: Request) {
  try {
    await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured on server" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim();
    if (!category || !CATEGORIES.some((c) => c.slug === category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const { topics, source, warning } = await suggestHotTopics(category, 6);
    return NextResponse.json({ ok: true, category, topics, source, warning });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("[admin ai-articles GET]", err);
    return NextResponse.json({ error: "Failed to load hot topics" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured on server" },
        { status: 503 }
      );
    }

    const authorId = await requireUserId(admin);
    const body = GenerateSchema.parse(await req.json());

    if (!CATEGORIES.some((c) => c.slug === body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const cat = CATEGORIES.find((c) => c.slug === body.category)!;
    const article = await generateSeoArticle({
      title: body.title,
      category: cat.name,
      searchIntent: body.searchIntent,
      affiliateNote:
        body.category === "finance"
          ? "Include educational disclaimer; no stock tips."
          : `Angle: current hot topic — ${body.searchIntent}`,
    });

    if (!article?.content || article.content.length < 400) {
      return NextResponse.json(
        { error: "AI generation failed or content too short. Try again." },
        { status: 502 }
      );
    }

    const slugHint = slugify(body.title).slice(0, 72);
    const blog = await publishGeneratedArticle({
      authorId,
      categorySlug: body.category,
      article,
      slugHint,
      publish: body.publish,
    });

    if (body.publish) {
      void dispatchBlogPublishedNotifications(blog.id);
      revalidatePath("/");
      revalidatePath("/blogs");
      revalidatePath(`/blog/${blog.slug}`);
      revalidatePath("/admin/blogs");
      revalidatePath("/sitemap.xml");
    }

    return NextResponse.json({
      ok: true,
      blog: {
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        readingTime: blog.readingTime,
        url: `/blog/${blog.slug}`,
      },
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
    console.error("[admin ai-articles POST]", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
