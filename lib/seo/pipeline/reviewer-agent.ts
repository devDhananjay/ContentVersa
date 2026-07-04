import { callGeminiText, isGeminiConfigured } from "@/lib/ai/gemini";
import {
  MIN_ARTICLE_WORDS,
  passesArticleQualityGate,
  wordCount,
} from "@/lib/seo/article-quality";
import type { PipelineArticle, ReviewReport } from "@/lib/seo/pipeline/types";

function localReview(article: PipelineArticle): ReviewReport {
  const words = wordCount(article.content);
  const suggestions: string[] = [];
  const grammarNotes: string[] = [];

  if (words < MIN_ARTICLE_WORDS) {
    suggestions.push(`Expand to at least ${MIN_ARTICLE_WORDS} words (now ${words}).`);
  }
  if (!/^##\s/m.test(article.content)) {
    suggestions.push("Add ## section headings for scannability.");
  }
  if ((article.metaTitle || "").length < 20) {
    suggestions.push("Strengthen meta title length.");
  }
  if ((article.metaDescription || "").length < 80) {
    suggestions.push("Write a fuller meta description.");
  }
  if (/lorem ipsum|click here|as an ai/i.test(article.content)) {
    grammarNotes.push("Remove placeholder or AI-disclosure phrasing.");
  }

  const passed = passesArticleQualityGate(article.content) && suggestions.length === 0;
  const score = Math.max(
    40,
    Math.min(
      98,
      50 +
        Math.min(30, Math.floor(words / 50)) +
        (passed ? 15 : 0) -
        suggestions.length * 8
    )
  );

  return {
    passed: passesArticleQualityGate(article.content),
    readability: words > 1400 ? "dense" : words > 900 ? "moderate" : "easy",
    grammarNotes,
    duplicationRisk: /what to know today|in today's fast-paced/i.test(article.content)
      ? "medium"
      : "low",
    suggestions,
    score,
  };
}

/** Reviewer agent: quality, readability, duplication risk. */
export async function runReviewerAgent(
  article: PipelineArticle
): Promise<ReviewReport> {
  const base = localReview(article);

  if (!isGeminiConfigured()) return base;

  try {
    const system = `You review blog drafts for AdSense-quality publishing. Return ONLY JSON:
{"passed":true,"readability":"easy|moderate|dense","grammarNotes":["..."],"duplicationRisk":"low|medium|high","suggestions":["..."],"score":0-100}
Be strict on thin/generic content.`;
    const user = JSON.stringify({
      title: article.title,
      excerpt: article.excerpt,
      wordCount: article.wordCount,
      metaTitle: article.metaTitle,
      contentPreview: article.content.slice(0, 4000),
    });
    const text = await callGeminiText(system, user, 2048);
    if (!text) return base;
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as Partial<ReviewReport>;
    return {
      passed:
        typeof parsed.passed === "boolean"
          ? parsed.passed && base.passed
          : base.passed,
      readability:
        parsed.readability === "easy" ||
        parsed.readability === "moderate" ||
        parsed.readability === "dense"
          ? parsed.readability
          : base.readability,
      grammarNotes: Array.isArray(parsed.grammarNotes)
        ? parsed.grammarNotes.map(String).slice(0, 5)
        : base.grammarNotes,
      duplicationRisk:
        parsed.duplicationRisk === "low" ||
        parsed.duplicationRisk === "medium" ||
        parsed.duplicationRisk === "high"
          ? parsed.duplicationRisk
          : base.duplicationRisk,
      suggestions: Array.isArray(parsed.suggestions)
        ? [...base.suggestions, ...parsed.suggestions.map(String)].slice(0, 8)
        : base.suggestions,
      score: Math.max(30, Math.min(99, Number(parsed.score) || base.score)),
    };
  } catch {
    return base;
  }
}
