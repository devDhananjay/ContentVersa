import { callGeminiText, isGeminiConfigured } from "@/lib/ai/gemini";
import {
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

/**
 * Full blog from title. Uses Gemini text→JSON (not responseSchema — Gemini often
 * returns "The string did not match the expected pattern" with strict schemas).
 * Always returns a usable package (local fallback).
 */
export async function generateFullBlogFromTitle(
  input: Input
): Promise<{ blog: FullBlogPackage; source: AiSource }> {
  const title = input.title.trim() || "Untitled blog";

  try {
    const system = `You are an expert ContentVerse blog writer. Given a title, produce a complete publish-ready blog package as JSON.
Rules:
- content: markdown body only (## section headings, NO # H1, NO article title repeated). Write 1200-1600 words across 6-8 sections with rich paragraphs and bullet lists.
- excerpt: compelling 2-3 sentence card hook (max 220 chars).
- category: exactly one slug from: ${VALID_CATEGORY_SLUGS.join(", ")}.
- tags: exactly 5 lowercase hyphenated slugs relevant to the article.
- metaTitle: SEO title under 70 chars.
- metaDescription: SEO description under 160 chars.
Tone: insightful, engaging, practical — for creators and readers. Use concrete examples.
Return ONLY valid JSON with keys: excerpt, category, tags, metaTitle, metaDescription, content. No markdown fences.`;

    const user = JSON.stringify({
      title,
      hintCategory: input.category || undefined,
      existingExcerpt: input.excerpt || undefined,
    });

    if (isGeminiConfigured()) {
      const text = await callGeminiText(system, user, 8192);
      if (text) {
        const parsed = parseFullBlogJson(text, title);
        if (parsed?.content) {
          return { blog: finalizePackage(parsed, title), source: "gemini" };
        }
      }
    }
  } catch (err) {
    console.error("[generate-full-blog]", err);
  }

  return {
    blog: buildRichLocalFullBlog(title, input.category),
    source: "local",
  };
}

export type { FullBlogPackage };
