import { NextResponse } from "next/server";
import { z } from "zod";
import { runAiAssist, buildPlaceholderImageUrl, type AiAction } from "@/lib/ai/assist";
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
  ]),
  title: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  imagePrompt: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = Schema.parse(body);

    if (parsed.action === "generate-image") {
      const prompt =
        parsed.imagePrompt?.trim() ||
        `Blog cover: ${parsed.title || "ContentVerse article"}`;
      const { result, source } = await runAiAssist({
        action: "generate-image",
        title: parsed.title,
        category: parsed.category,
        imagePrompt: prompt,
      });
      const imageUrl = typeof result === "string" ? result : buildPlaceholderImageUrl(prompt);
      if (imageUrl.includes("picsum.photos")) {
        return NextResponse.json(
          {
            ok: false,
            error: "Gemini image generation failed. Set GEMINI_API_KEY in .env.",
            source,
          },
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

    const { result, source } = await runAiAssist({
      action: parsed.action as AiAction,
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      category: parsed.category,
      imagePrompt: parsed.imagePrompt,
    });

    return NextResponse.json({ ok: true, result, source });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[ai assist]", err);
    return NextResponse.json({ error: "AI assist failed" }, { status: 500 });
  }
}
