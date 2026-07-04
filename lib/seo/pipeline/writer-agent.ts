import { CATEGORIES } from "@/lib/data/categories";
import { generateSeoArticle } from "@/lib/seo/article-generator";
import { wordCount } from "@/lib/seo/article-quality";
import { readingTime } from "@/lib/utils";
import type { PipelineArticle, ResearchTopic } from "@/lib/seo/pipeline/types";

/** Writer agent: long-form SEO article from research topic. */
export async function runWriterAgent(input: {
  categorySlug: string;
  topic: ResearchTopic;
}): Promise<PipelineArticle> {
  const cat = CATEGORIES.find((c) => c.slug === input.categorySlug);
  if (!cat) throw new Error("Invalid category");

  const { article, failure, reason } = await generateSeoArticle({
    title: input.topic.title,
    category: cat.name,
    categorySlug: input.categorySlug,
    searchIntent: input.topic.searchIntent,
    affiliateNote:
      input.categorySlug === "finance"
        ? "Include a short disclaimer that this is educational, not financial advice."
        : undefined,
  });

  if (!article?.content) {
    throw new Error(
      failure?.message || reason || "Writer agent failed to produce content"
    );
  }

  return {
    title: article.title || input.topic.title,
    excerpt: article.excerpt,
    content: article.content.trim(),
    tags: article.tags?.length ? article.tags : input.topic.keywords.slice(0, 5),
    metaTitle: article.title || input.topic.title,
    metaDescription: article.metaDescription || article.excerpt,
    coverKeywords: article.coverKeywords ?? input.topic.keywords,
    coverImagePrompt: article.coverImagePrompt ?? "",
    readingTime: readingTime(article.content),
    wordCount: wordCount(article.content),
  };
}
