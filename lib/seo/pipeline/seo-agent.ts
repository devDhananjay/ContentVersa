import { callGeminiText, isGeminiConfigured } from "@/lib/ai/gemini";
import type { PipelineArticle, ResearchTopic } from "@/lib/seo/pipeline/types";

function ensureHeadingStructure(content: string, title: string): string {
  let md = content.trim();
  if (!/^##\s/m.test(md)) {
    md = `## Introduction\n\n${md}`;
  }
  // Strip accidental H1 that duplicates title
  md = md.replace(new RegExp(`^#\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "im"), "");
  md = md.replace(/^#\s+/gm, "## ");
  return md.trim();
}

/** SEO agent: headings, meta title/description, tags. */
export async function runSeoAgent(input: {
  article: PipelineArticle;
  topic: ResearchTopic;
}): Promise<PipelineArticle> {
  const article = { ...input.article };
  article.content = ensureHeadingStructure(article.content, article.title);

  const keywords = input.topic.keywords.slice(0, 5);
  if (!article.tags.length) article.tags = keywords;

  let metaTitle = (article.metaTitle || article.title).slice(0, 70);
  let metaDescription = (article.metaDescription || article.excerpt).slice(0, 160);

  if (isGeminiConfigured()) {
    try {
      const system = `You are an SEO editor for an Indian blog. Return ONLY JSON:
{"metaTitle":"under 60 chars with primary keyword","metaDescription":"under 155 chars, compelling","tags":["5-slug-tags"]}
No markdown fences.`;
      const user = JSON.stringify({
        title: article.title,
        searchIntent: input.topic.searchIntent,
        keywords: input.topic.keywords,
        excerpt: article.excerpt,
      });
      const text = await callGeminiText(system, user, 1024);
      if (text) {
        const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        const parsed = JSON.parse(cleaned) as {
          metaTitle?: string;
          metaDescription?: string;
          tags?: string[];
        };
        if (parsed.metaTitle) metaTitle = parsed.metaTitle.slice(0, 70);
        if (parsed.metaDescription) metaDescription = parsed.metaDescription.slice(0, 160);
        if (Array.isArray(parsed.tags) && parsed.tags.length) {
          article.tags = parsed.tags.map(String).slice(0, 5);
        }
      }
    } catch {
      // keep existing meta
    }
  }

  // Prefer primary keyword early in meta title
  const primary = input.topic.keywords[0];
  if (primary && !metaTitle.toLowerCase().includes(primary.toLowerCase())) {
    metaTitle = `${primary}: ${metaTitle}`.slice(0, 70);
  }

  article.metaTitle = metaTitle;
  article.metaDescription = metaDescription;
  return article;
}
