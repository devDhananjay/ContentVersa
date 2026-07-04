import { resolveArticleCoverImage } from "@/lib/seo/article-cover";
import type { PipelineArticle, ResearchTopic } from "@/lib/seo/pipeline/types";

/** Image agent: content-matched cover (Gemini image when available, else fallback). */
export async function runImageAgent(input: {
  categorySlug: string;
  topic: ResearchTopic;
  article: PipelineArticle;
}): Promise<PipelineArticle> {
  const article = { ...input.article };
  const prompt =
    article.coverImagePrompt?.trim() ||
    [
      `Photorealistic editorial photo for: ${article.title}.`,
      `Keywords: ${[...article.coverKeywords, ...input.topic.keywords].slice(0, 6).join(", ")}.`,
      "Indian context when relevant. No text or logos.",
    ].join(" ");

  article.coverImagePrompt = prompt;

  const coverImage = await resolveArticleCoverImage(
    {
      categorySlug: input.categorySlug,
      title: article.title,
      excerpt: article.excerpt,
      tags: article.tags,
      coverKeywords: article.coverKeywords,
      coverImagePrompt: prompt,
      searchIntent: input.topic.searchIntent,
      contentSnippet: article.content.slice(0, 800),
      slug: article.title,
    },
    { preferAi: true, retries: 2 }
  );

  article.coverImage = coverImage;
  return article;
}
