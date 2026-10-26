import { callGeminiJson, isGeminiConfigured } from "@/lib/ai/gemini";
import { upsertHiDraft } from "@/lib/i18n/blog-translations";
import { categoryNeedsHiApproval } from "@/lib/i18n/policy";
import type { TranslationStatus } from "@prisma/client";

type TranslateInput = {
  blogId: string;
  title: string;
  excerpt?: string | null;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  categorySlug?: string | null;
  /** Force status; default DRAFT, or READY for non-sensitive niches */
  status?: TranslationStatus;
};

type HiPackage = {
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
};

/**
 * Machine-translate EN blog fields → Hindi draft (Gemini JSON).
 */
export async function translateBlogToHindi(
  input: TranslateInput
): Promise<{ ok: true; status: TranslationStatus } | { ok: false; error: string }> {
  if (!isGeminiConfigured()) {
    return { ok: false, error: "GEMINI_API_KEY is not configured" };
  }

  const system = `You are a professional Hindi translator for ContentVerse India.
Translate the English article into natural, clear Hindi (Devanagari).
Keep markdown structure, headings, lists, and links intact.
Do not invent facts. Keep Indian proper nouns (schemes, cities, brands) readable.
Return JSON only with keys: title, excerpt, content, metaTitle, metaDescription.`;

  const user = JSON.stringify({
    title: input.title,
    excerpt: input.excerpt || "",
    content: input.content.slice(0, 48000),
    metaTitle: input.metaTitle || input.title,
    metaDescription: input.metaDescription || input.excerpt || "",
  });

  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
      excerpt: { type: "string" },
      content: { type: "string" },
      metaTitle: { type: "string" },
      metaDescription: { type: "string" },
    },
    required: ["title", "excerpt", "content", "metaTitle", "metaDescription"],
  };

  try {
    const pack = await callGeminiJson<HiPackage>(system, user, schema, 8192, {
      maxInputChars: 48_000,
      temperature: 0.3,
    });
    if (!pack?.title || !pack?.content) {
      return { ok: false, error: "Translation returned empty content" };
    }

    const needsApprove = categoryNeedsHiApproval(input.categorySlug);
    const status: TranslationStatus =
      input.status ?? (needsApprove ? "DRAFT" : "READY");

    await upsertHiDraft({
      blogId: input.blogId,
      title: pack.title,
      excerpt: pack.excerpt || null,
      content: pack.content,
      metaTitle: pack.metaTitle || pack.title,
      metaDescription: pack.metaDescription || pack.excerpt || null,
      source: "AI",
      status,
    });

    return { ok: true, status };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Translation failed",
    };
  }
}
