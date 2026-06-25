import { callGeminiImage, isGeminiConfigured } from "@/lib/ai/gemini";
import { normalizeCoverImageUrl } from "@/lib/server/upload-cover";
import type { CoverImageInput } from "@/lib/seo/cover-image";
import { pickCoverForNewArticle } from "@/lib/seo/pick-cover";

export type ArticleCoverInput = CoverImageInput & {
  slug: string;
};

/** Build a Gemini prompt that reflects the article topic (not generic category art). */
export function buildCoverImagePrompt(input: {
  title: string;
  excerpt?: string;
  categorySlug?: string;
  coverKeywords?: string[];
}): string {
  const keywordLine =
    input.coverKeywords?.filter(Boolean).slice(0, 4).join("; ") ||
    "relevant professional scene for the article topic";
  const excerpt = input.excerpt?.trim().slice(0, 160) || "";
  const category = input.categorySlug?.replace(/-/g, " ") || "general";

  return [
    `Editorial blog hero photograph for: "${input.title}".`,
    excerpt ? `Summary: ${excerpt}.` : "",
    `Must visually depict: ${keywordLine}.`,
    `Category mood: ${category}.`,
    "Photorealistic, cinematic lighting, modern composition, Indian context when the topic is India-specific.",
    "No text, no logos, no watermarks, no faces looking at camera, 16:9 wide shot.",
  ]
    .filter(Boolean)
    .join(" ");
}

function aiCoversEnabled(): boolean {
  if (process.env.AI_COVER_IMAGES === "0") return false;
  return isGeminiConfigured();
}

/**
 * Resolve a cover for AI/cron-generated articles:
 * 1) Gemini image from title + coverKeywords (uploaded to storage)
 * 2) Themed Unsplash pool fallback
 */
export async function resolveArticleCoverImage(
  input: ArticleCoverInput,
  options?: { preferAi?: boolean }
): Promise<string> {
  const preferAi = options?.preferAi ?? true;

  if (preferAi && aiCoversEnabled()) {
    try {
      const prompt = buildCoverImagePrompt({
        title: input.title,
        excerpt: input.excerpt,
        categorySlug: input.categorySlug,
        coverKeywords: input.coverKeywords,
      });
      const dataUrl = await callGeminiImage(prompt);
      if (dataUrl && !dataUrl.includes("picsum.photos")) {
        const uploaded = await normalizeCoverImageUrl(dataUrl);
        if (uploaded) return uploaded;
      }
    } catch (error) {
      console.warn("[article-cover] Gemini cover failed, using stock fallback:", error);
    }
  }

  return pickCoverForNewArticle(input);
}
