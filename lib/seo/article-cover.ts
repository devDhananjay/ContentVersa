import { callGeminiImage, isGeminiConfigured } from "@/lib/ai/gemini";
import { normalizeCoverImageUrl } from "@/lib/server/upload-cover";
import type { CoverImageInput } from "@/lib/seo/cover-image";
import { detectCoverTheme } from "@/lib/seo/cover-image";
import { pickCoverForNewArticle } from "@/lib/seo/pick-cover";
import {
  coverPromptMatchesTitle,
  extractSceneFromArticle,
} from "@/lib/seo/article-quality";

export type ArticleCoverInput = CoverImageInput & {
  slug: string;
  coverImagePrompt?: string;
  searchIntent?: string;
  contentSnippet?: string;
};

/** Primary visual subject from title + intent (sports, places, products, etc.). */
function extractPrimarySubject(input: {
  title: string;
  searchIntent?: string;
  coverKeywords?: string[];
  categorySlug?: string;
}): string {
  const combined = [
    input.title,
    input.searchIntent ?? "",
    ...(input.coverKeywords ?? []),
  ]
    .join(" ")
    .trim();

  const sportMatch = combined.match(
    /\b(IPL|T20|ODI|Test match|cricket|football|soccer|hockey|kabaddi|badminton|tennis|Olympics|World Cup|Asian Games|Pro Kabaddi|PKL|ISL|F1|Formula 1|marathon|wrestling|boxing|athletics|medal|stadium|wicket|batsman|bowler|goalkeeper|coach|player|team)\b[^.]{0,40}/i
  );
  if (sportMatch) return sportMatch[0].trim().slice(0, 120);

  const placeMatch = combined.match(
    /\b(Mumbai|Delhi|Bengaluru|Bangalore|Chennai|Kolkata|Hyderabad|Pune|Goa|Kerala|Rajasthan|India)\b[^.]{0,30}/i
  );
  if (placeMatch && input.categorySlug === "travel") return placeMatch[0].trim();

  const keyword = input.coverKeywords?.find((k) => k.trim().length > 8);
  if (keyword) return keyword.trim().slice(0, 120);

  return input.title.trim().slice(0, 100);
}

/** Build a Gemini prompt that reflects the exact article topic. */
export function buildCoverImagePrompt(input: {
  title: string;
  excerpt?: string;
  categorySlug?: string;
  coverKeywords?: string[];
  coverImagePrompt?: string;
  searchIntent?: string;
  contentSnippet?: string;
}): string {
  const dedicated = input.coverImagePrompt?.trim();
  if (dedicated && dedicated.length >= 40) {
    return [
      dedicated,
      "Photorealistic editorial sports/news photography when applicable.",
      "Indian setting when the topic is India-specific.",
      "No text, logos, watermarks, faces staring at camera.",
    ].join(" ");
  }

  const primary = extractPrimarySubject(input);
  const keywords =
    input.coverKeywords?.filter(Boolean).slice(0, 5).join(", ") ||
    primary;
  const excerpt = input.excerpt?.trim().slice(0, 180) || "";
  const intent = input.searchIntent?.trim().slice(0, 120) || "";
  const snippet = input.contentSnippet?.trim().slice(0, 280) || "";
  const scene = snippet ? extractSceneFromArticle(snippet, input.title) : input.title;
  const category = input.categorySlug?.replace(/-/g, " ") || "general";
  const theme = detectCoverTheme({
    categorySlug: input.categorySlug ?? "technology",
    title: input.title,
    excerpt: input.excerpt,
    coverKeywords: input.coverKeywords,
    tags: [],
  });

  const themeHints: Record<string, string> = {
    sports:
      "Show the specific sport and action from the title — cricket bat/ball/stadium, football pitch, hockey stick, etc. Never a generic gym or unrelated sport.",
    movies: "Cinema, film set, theatre seats, or streaming-at-home scene matching the film/show topic.",
    finance: "Charts, rupee notes, planning desk — not shopping or travel.",
    travel: "Landscape or landmark from the destination named in the title.",
    food: "The dish or cuisine mentioned, styled food photography.",
    health: "Medical or wellness scene matching the article subject.",
    gaming: "Gaming setup, controller, or esports arena.",
    code: "Developer at laptop with code on screen.",
    data: "AI/data visualization matching the article angle.",
  };

  return [
    `Hero photograph for blog article: "${input.title}".`,
    intent ? `Reader intent: ${intent}.` : "",
    excerpt ? `Article summary: ${excerpt}.` : "",
    snippet ? `Opening context: ${snippet}.` : "",
    `Scene to depict: ${scene}.`,
    `MUST clearly show: ${primary}.`,
    `Visual elements: ${keywords}.`,
    themeHints[theme ?? ""] ?? `Mood fits ${category} but stay specific to the title, not generic stock.`,
    "Photorealistic, cinematic lighting, sharp focus on the main subject, 16:9 wide composition.",
    "Indian context when relevant (jerseys, cities, rupees, festivals).",
    "Absolutely no text overlays, brand logos, watermarks, or wrong unrelated imagery.",
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
 * 1) Gemini image from coverImagePrompt / title + keywords (uploaded to storage)
 * 2) Themed Unsplash pool fallback
 */
export async function resolveArticleCoverImage(
  input: ArticleCoverInput,
  options?: { preferAi?: boolean; retries?: number }
): Promise<string> {
  const preferAi = options?.preferAi ?? true;
  const retries = Math.max(1, options?.retries ?? 2);

  if (preferAi && aiCoversEnabled()) {
    let prompt = buildCoverImagePrompt({
      title: input.title,
      excerpt: input.excerpt,
      categorySlug: input.categorySlug,
      coverKeywords: input.coverKeywords,
      coverImagePrompt: input.coverImagePrompt,
      searchIntent: input.searchIntent,
      contentSnippet: input.contentSnippet,
    });

    for (let attempt = 0; attempt < retries; attempt++) {
      if (!coverPromptMatchesTitle(prompt, input.title) && input.contentSnippet) {
        const scene = extractSceneFromArticle(input.contentSnippet, input.title);
        prompt = `${prompt} Critical: the image must illustrate "${input.title}" — show ${scene}.`;
      }

      try {
        const dataUrl = await callGeminiImage(prompt);
        if (dataUrl && !dataUrl.includes("picsum.photos")) {
          const uploaded = await normalizeCoverImageUrl(dataUrl);
          if (uploaded) return uploaded;
        }
      } catch (error) {
        console.warn(`[article-cover] Gemini attempt ${attempt + 1} failed:`, error);
      }

      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  return pickCoverForNewArticle(input);
}
