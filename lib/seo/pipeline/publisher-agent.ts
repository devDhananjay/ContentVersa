import type { GeneratedArticle } from "@/lib/seo/article-generator";
import { publishGeneratedArticle } from "@/lib/seo/publish-article";
import type { PipelineArticle, ResearchTopic } from "@/lib/seo/pipeline/types";

/** Publisher agent: persist draft or live post on ContentVerse. */
export async function runPublisherAgent(input: {
  authorId: string;
  categorySlug: string;
  topic: ResearchTopic;
  article: PipelineArticle;
  publish: boolean;
}) {
  const generated: GeneratedArticle = {
    title: input.article.title,
    excerpt: input.article.excerpt,
    metaDescription: input.article.metaDescription,
    metaKeywords: input.article.tags.join(", "),
    tags: input.article.tags,
    coverKeywords: input.article.coverKeywords,
    coverImagePrompt: input.article.coverImagePrompt,
    content: input.article.content,
  };

  const blog = await publishGeneratedArticle({
    authorId: input.authorId,
    categorySlug: input.categorySlug,
    article: generated,
    publish: input.publish,
    searchIntent: input.topic.searchIntent,
    coverImage: input.article.coverImage,
  });

  return {
    id: blog.id,
    slug: blog.slug,
    status: blog.status,
    previewUrl: `/blog/${blog.slug}`,
    editUrl: `/dashboard/blogs/${blog.id}/edit`,
  };
}
