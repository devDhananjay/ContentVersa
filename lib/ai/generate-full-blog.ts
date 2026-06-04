import { callGeminiJson, isGeminiConfigured } from "@/lib/ai/gemini";
import {
  FULL_BLOG_JSON_SCHEMA,
  buildRichLocalFullBlog,
  normalizeCategorySlug,
  normalizeTags,
  parseFullBlogJson,
  type FullBlogPackage,
  VALID_CATEGORY_SLUGS,
} from "@/lib/ai/full-blog-package";
import type { AiSource } from "@/lib/ai/assist";

type Input = {
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
};

function finalizePackage(raw: Partial<FullBlogPackage>, title: string): FullBlogPackage {
  const category = normalizeCategorySlug(raw.category, title);
  const content = (raw.content || "").trim();
  const excerpt =
    (raw.excerpt || "").trim() ||
    content.split("\n\n").find((p) => p.trim() && !p.startsWith("#"))?.slice(0, 220) ||
    title;
  return {
    excerpt,
    category,
    tags: normalizeTags(raw.tags, title, category),
    metaTitle: (raw.metaTitle || title).slice(0, 70),
    metaDescription: (raw.metaDescription || excerpt).slice(0, 160),
    content,
  };
}

export async function generateFullBlogFromTitle(
  input: Input
): Promise<{ blog: FullBlogPackage; source: AiSource }> {
  const title = input.title.trim();
  const system = `You are an expert ContentVerse blog writer. Given a title, produce a complete publish-ready blog package as JSON.
Rules:
- content: markdown body only (## section headings, NO # H1, NO article title repeated). Write 1200-1600 words across 6-8 sections with rich paragraphs and bullet lists.
- excerpt: compelling 2-3 sentence card hook (max 220 chars).
- category: exactly one slug from: ${VALID_CATEGORY_SLUGS.join(", ")}.
- tags: exactly 5 lowercase hyphenated slugs relevant to the article.
- metaTitle: SEO title under 70 chars.
- metaDescription: SEO description under 160 chars.
Tone: insightful, engaging, practical — for creators and readers. Use concrete examples.`;

  const user = JSON.stringify({
    title,
    hintCategory: input.category || undefined,
    existingExcerpt: input.excerpt || undefined,
  });

  if (isGeminiConfigured()) {
    const json = await callGeminiJson<Partial<FullBlogPackage>>(
      system,
      user,
      FULL_BLOG_JSON_SCHEMA,
      8192
    );
    if (json?.content) {
      return { blog: finalizePackage(json, title), source: "gemini" };
    }

    // Fallback: plain text then parse if model returned markdown wrapped in JSON string
    const { callGeminiText } = await import("@/lib/ai/gemini");
    const text = await callGeminiText(
      system + " Return ONLY valid JSON matching the schema.",
      user,
      8192
    );
    if (text) {
      const parsed = parseFullBlogJson(text, title);
      if (parsed) return { blog: parsed, source: "gemini" };
    }
  }

  return {
    blog: buildRichLocalFullBlog(title, input.category),
    source: "local",
  };
}

export type { FullBlogPackage };
