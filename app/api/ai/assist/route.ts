import { NextResponse } from "next/server";
import { z } from "zod";
import { runAiAssist, buildPlaceholderImageUrl, type AiAction } from "@/lib/ai/assist";

const Schema = z.object({
  action: z.enum([
    "summarize",
    "seo-title",
    "blog-ideas",
    "excerpt",
    "tags",
    "image-prompt",
    "generate-image",
    "expand-thesis",
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
      const imageUrl = buildPlaceholderImageUrl(prompt);
      return NextResponse.json({
        ok: true,
        prompt,
        imageUrl,
        source: process.env.OPENAI_API_KEY ? "openai" : "local",
        note: "Demo image from picsum.photos. Set OPENAI_API_KEY for richer prompts.",
      });
    }

    const { result, source } = await runAiAssist({
      action: parsed.action as AiAction,
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      category: parsed.category,
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
