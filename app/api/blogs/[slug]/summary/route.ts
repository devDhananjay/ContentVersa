import { NextResponse } from "next/server";
import { z } from "zod";
import { getBlogBySlugHybrid } from "@/lib/data/blog-db";
import { runAiAssist } from "@/lib/ai/assist";
import { countWords, SHORTS_SLOGAN_WORDS } from "@/lib/utils";
import { finalizeArticleSummary } from "@/lib/ai/article-summary";

const BodySchema = z.object({
  title: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
});

/** POST /api/blogs/:slug/summary — full article AI summary */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;
    const blog = await getBlogBySlugHybrid(slug);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    let body: z.infer<typeof BodySchema> = {};
    try {
      const json = await req.json();
      body = BodySchema.parse(json);
    } catch {
      /* use blog fields */
    }

    const { result, source } = await runAiAssist({
      action: "article-summary",
      title: body.title || blog.title,
      excerpt: body.excerpt || blog.excerpt,
      content: body.content || blog.content,
      category: body.category || blog.category,
    });

    const raw = typeof result === "string" ? result : String(result);
    const content = body.content || blog.content;
    const { summary, padded, articleWords, targetWords } = finalizeArticleSummary(
      raw,
      content,
      body.title || blog.title
    );

    return NextResponse.json({
      ok: true,
      summary,
      headline: blog.title,
      wordCount: countWords(summary),
      articleWords,
      targetWords,
      sloganWords: SHORTS_SLOGAN_WORDS,
      source,
      padded,
      slug,
    });
  } catch (err) {
    console.error("[blog summary]", err);
    return NextResponse.json({ error: "Summary failed" }, { status: 500 });
  }
}
