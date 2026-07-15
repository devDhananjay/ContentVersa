import { NextResponse } from "next/server";
import { z } from "zod";
import { runAiAssist, buildPlaceholderImageUrl, type AiAction } from "@/lib/ai/assist";
import { BlogGenerationError } from "@/lib/ai/generate-full-blog";
import { isGeminiConfigured } from "@/lib/ai/gemini";

const Schema = z.object({
  action: z.enum([
    "summarize",
    "article-summary",
    "seo-title",
    "blog-ideas",
    "excerpt",
    "tags",
    "image-prompt",
    "generate-image",
    "expand-thesis",
    "generate-from-title",
    "suggest-category",
  ]),
  title: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  imagePrompt: z.string().optional(),
});

function friendlyAiError(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "AI assist failed";
  if (/did not match the expected pattern/i.test(raw)) {
    return "AI could not format the draft. Try again, or write a clearer title.";
  }
  if (/quota|rate.?limit|RESOURCE_EXHAUSTED/i.test(raw)) {
    return "AI quota exceeded. Try again in a few minutes.";
  }
  return raw.length > 160 ? "AI assist failed. Please try again." : raw;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = Schema.parse(body);

    if (parsed.action === "generate-image") {
      const prompt =
        parsed.imagePrompt?.trim() ||
        `Blog cover: ${parsed.title || "ContentVerse article"}`;
      const { result, source, failure } = await runAiAssist({
        action: "generate-image",
        title: parsed.title,
        category: parsed.category,
        imagePrompt: prompt,
      });
      const imageUrl = typeof result === "string" ? result : buildPlaceholderImageUrl(prompt);
      if (imageUrl.includes("picsum.photos")) {
        const missingKey = failure?.message?.includes("not configured");
        const quota = failure?.quotaExceeded;
        const error = missingKey
          ? "GEMINI_API_KEY is not set on the server. Add it to .env and restart."
          : quota
            ? "Gemini image quota exceeded. Try again later or enable billing in Google AI Studio."
            : failure?.message
              ? `Gemini image failed: ${failure.message}`
              : "Gemini image generation failed. Check GEMINI_API_KEY and image model access.";
        return NextResponse.json(
          { ok: false, error, source, failure },
          { status: 503 }
        );
      }
      return NextResponse.json({
        ok: true,
        prompt,
        imageUrl,
        source,
        note: source === "gemini" ? "Generated with Gemini." : "Image ready.",
      });
    }

    let result: Awaited<ReturnType<typeof runAiAssist>>["result"];
    let source: Awaited<ReturnType<typeof runAiAssist>>["source"];
    try {
      ({ result, source } = await runAiAssist({
        action: parsed.action as AiAction,
        title: parsed.title,
        excerpt: parsed.excerpt,
        content: parsed.content,
        category: parsed.category,
        imagePrompt: parsed.imagePrompt,
      }));
    } catch (err) {
      if (err instanceof BlogGenerationError) {
        return NextResponse.json(
          {
            error: err.message,
            code: err.code,
          },
          { status: err.code === "GEMINI_QUOTA" ? 429 : 503 }
        );
      }
      throw err;
    }

    if (parsed.action === "generate-from-title" && typeof result === "object" && result !== null && "content" in result) {
      const blog = result as import("@/lib/ai/full-blog-package").FullBlogPackage;
      return NextResponse.json({
        ok: true,
        source,
        blog,
        result: blog.content,
      });
    }

    return NextResponse.json({ ok: true, result, source });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[ai assist]", err);
    return NextResponse.json({ error: friendlyAiError(err) }, { status: 500 });
  }
}
