/**
 * Mandatory refine before any blog goes PUBLISHED:
 * expand thin copy → deterministic AI scrub → humanize leftover tone →
 * scrub again → hard AI-free + length gate.
 */
import { generateSeoArticle } from "@/lib/seo/article-generator";
import { humanizeArticle } from "@/lib/seo/humanize-article";
import {
  AiFreePublishError,
  prepareAiFreePublishFields,
  scrubAiFreeText,
  type AiFreePublishFields,
} from "@/lib/seo/ai-free-content";
import { countAiSmellMarkers } from "@/lib/seo/ai-smell";
import {
  MIN_ARTICLE_WORDS,
  passesArticleQualityGate,
  wordCount,
} from "@/lib/seo/article-quality";

function applyDeterministicScrub(fields: {
  title: string;
  excerpt: string | null;
  content: string;
  metaDescription: string | null;
}) {
  return {
    title: scrubAiFreeText(fields.title),
    excerpt: fields.excerpt != null ? scrubAiFreeText(fields.excerpt) : null,
    content: scrubAiFreeText(fields.content),
    metaDescription:
      fields.metaDescription != null
        ? scrubAiFreeText(fields.metaDescription)
        : null,
  };
}

export class RefinePublishError extends Error {
  readonly code = "REFINE_REQUIRED" as const;
  constructor(
    message: string,
    readonly reason: "thin" | "ai" | "quota" | "generation"
  ) {
    super(message);
    this.name = "RefinePublishError";
  }
}

export function isRefinePublishError(err: unknown): err is RefinePublishError {
  return err instanceof RefinePublishError;
}

export type RefineForPublishResult = AiFreePublishFields & {
  expanded: boolean;
  humanized: boolean;
  words: number;
};

const TARGET_MIN = 1100;
const TARGET_MAX = 1400;

/**
 * Refine article fields for live publish. Safe to call on every publish path.
 * Throws RefinePublishError / AiFreePublishError if the post cannot go live clean.
 */
export async function refineForPublish(input: {
  title: string;
  excerpt?: string | null;
  content: string;
  metaDescription?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  searchIntent?: string | null;
  /** Skip Gemini expand/humanize (scrub + gates only). */
  scrubOnly?: boolean;
}): Promise<RefineForPublishResult> {
  let title = input.title.trim();
  let excerpt = input.excerpt ?? null;
  let content = input.content.trim();
  let metaDescription = input.metaDescription ?? null;
  let expanded = false;
  let humanized = false;

  const category = input.categoryName?.trim() || "General";
  const categorySlug = input.categorySlug?.trim() || "technology";

  if (!input.scrubOnly) {
    const wordsBefore = wordCount(content);
    const markersBefore = countAiSmellMarkers(
      `${title}\n${excerpt || ""}\n${content}`
    );

    // Expand thin posts before they hit the index
    if (wordsBefore < 1000) {
      try {
        const { article, failure, reason } = await generateSeoArticle({
          title,
          category,
          categorySlug,
          searchIntent:
            input.searchIntent?.trim() ||
            metaDescription ||
            excerpt ||
            title,
          expandFrom: content,
          minWords: TARGET_MIN,
          maxWords: TARGET_MAX,
        });
        if (failure?.quotaExceeded || reason === "quota") {
          if (wordsBefore < MIN_ARTICLE_WORDS) {
            throw new RefinePublishError(
              "Article is too short to publish and AI expand is temporarily unavailable. Add more original detail (800+ words), then try again.",
              "quota"
            );
          }
        } else if (article?.content && wordCount(article.content) > wordsBefore) {
          title = article.title || title;
          excerpt = article.excerpt || excerpt;
          content = article.content.trim();
          metaDescription = article.metaDescription || metaDescription;
          expanded = true;
        } else if (wordsBefore < MIN_ARTICLE_WORDS) {
          throw new RefinePublishError(
            `Article is too thin to publish (${wordsBefore} words). Expand to at least ${MIN_ARTICLE_WORDS} words with original India-focused detail.`,
            "thin"
          );
        }
      } catch (err) {
        if (isRefinePublishError(err) || err instanceof AiFreePublishError) throw err;
        if (wordsBefore < MIN_ARTICLE_WORDS) {
          throw new RefinePublishError(
            `Article is too thin to publish (${wordsBefore} words). Expand to at least ${MIN_ARTICLE_WORDS} words.`,
            "thin"
          );
        }
      }
    }

    // Cheap phrase filter first so obvious AI tells never go live as-is
    ({ title, excerpt, content, metaDescription } = applyDeterministicScrub({
      title,
      excerpt,
      content,
      metaDescription,
    }));

    const markersMid = countAiSmellMarkers(
      `${title}\n${excerpt || ""}\n${content}`
    );
    if (markersMid >= 1) {
      try {
        const result = await humanizeArticle({
          title,
          category,
          content,
          excerpt,
        });
        if (result.reason === "quota" && markersMid >= 2) {
          throw new RefinePublishError(
            "Article still sounds AI-written and humanize is temporarily unavailable. Edit the draft manually, then publish.",
            "quota"
          );
        }
        if (result.article) {
          title = result.article.title || title;
          excerpt = result.article.excerpt || excerpt;
          content = result.article.content.trim();
          metaDescription =
            result.article.metaDescription || metaDescription;
          humanized = true;
          // Scrub again after model rewrite — models reintroduce filler
          ({ title, excerpt, content, metaDescription } = applyDeterministicScrub({
            title,
            excerpt,
            content,
            metaDescription,
          }));
        } else if (markersMid >= 2) {
          throw new RefinePublishError(
            "AI-sounding phrases could not be cleaned automatically. Edit the draft (remove AI filler), then Approve & Publish again.",
            "ai"
          );
        }
      } catch (err) {
        if (isRefinePublishError(err) || err instanceof AiFreePublishError) throw err;
        if (markersMid >= 2) {
          throw new RefinePublishError(
            "AI cleanup failed. Edit the draft manually, then try Approve & Publish again.",
            "ai"
          );
        }
      }
    }
  } else {
    ({ title, excerpt, content, metaDescription } = applyDeterministicScrub({
      title,
      excerpt,
      content,
      metaDescription,
    }));
  }

  // Final hard AI-free scrub + marker gate (blocks publish if smell remains)
  const cleaned = prepareAiFreePublishFields({
    title,
    excerpt,
    content,
    metaDescription,
  });

  const words = wordCount(cleaned.content);
  if (words < MIN_ARTICLE_WORDS || !passesArticleQualityGate(cleaned.content)) {
    throw new RefinePublishError(
      `Article is too thin after refine (${words} words). Need at least ${MIN_ARTICLE_WORDS} solid words before publish.`,
      "thin"
    );
  }

  return {
    ...cleaned,
    expanded,
    humanized,
    words,
  };
}
