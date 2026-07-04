import { runResearchAgent } from "@/lib/seo/pipeline/research-agent";
import { runWriterAgent } from "@/lib/seo/pipeline/writer-agent";
import { runSeoAgent } from "@/lib/seo/pipeline/seo-agent";
import { runImageAgent } from "@/lib/seo/pipeline/image-agent";
import { runReviewerAgent } from "@/lib/seo/pipeline/reviewer-agent";
import { runPublisherAgent } from "@/lib/seo/pipeline/publisher-agent";
import type {
  PipelineRunResult,
  PipelineStepResult,
  ResearchTopic,
} from "@/lib/seo/pipeline/types";

async function timed<T>(
  id: PipelineStepResult["id"],
  label: string,
  fn: () => Promise<T>
): Promise<{ value: T; step: PipelineStepResult }> {
  const started = Date.now();
  try {
    const value = await fn();
    return {
      value,
      step: {
        id,
        label,
        status: "done",
        ms: Date.now() - started,
      },
    };
  } catch (err) {
    throw {
      step: {
        id,
        label,
        status: "failed" as const,
        error: err instanceof Error ? err.message : "Step failed",
        ms: Date.now() - started,
      },
      err,
    };
  }
}

export async function researchPipelineTopics(categorySlug: string, count = 6) {
  return runResearchAgent(categorySlug, count);
}

/** Full multi-agent run for one topic. */
export async function runPublishingPipeline(input: {
  authorId: string;
  categorySlug: string;
  topic: ResearchTopic;
  publish?: boolean;
  requireReviewPass?: boolean;
}): Promise<PipelineRunResult> {
  const steps: PipelineStepResult[] = [];
  const publish = input.publish === true;
  const requireReviewPass = input.requireReviewPass !== false;

  const result: PipelineRunResult = {
    ok: false,
    category: input.categorySlug,
    topic: input.topic,
    steps,
  };

  try {
    steps.push({
      id: "research",
      label: "Research Agent",
      status: "done",
      summary: `SEO ${input.topic.seoScore}/100 · ${input.topic.competition} competition`,
      detail: {
        keywords: input.topic.keywords,
        sources: input.topic.sources,
        searchIntent: input.topic.searchIntent,
      },
    });

    const writer = await timed("writer", "Writer Agent", () =>
      runWriterAgent({
        categorySlug: input.categorySlug,
        topic: input.topic,
      })
    );
    writer.step.summary = `${writer.value.wordCount} words · ${writer.value.readingTime} min read`;
    steps.push(writer.step);
    let article = writer.value;

    const seo = await timed("seo", "SEO Agent", () =>
      runSeoAgent({ article, topic: input.topic })
    );
    seo.step.summary = seo.value.metaTitle;
    seo.step.detail = {
      metaTitle: seo.value.metaTitle,
      metaDescription: seo.value.metaDescription,
      tags: seo.value.tags,
    };
    steps.push(seo.step);
    article = seo.value;

    const image = await timed("image", "Image Agent", () =>
      runImageAgent({
        categorySlug: input.categorySlug,
        topic: input.topic,
        article,
      })
    );
    image.step.summary = image.value.coverImage
      ? "Cover image ready"
      : "Cover fallback used";
    image.step.detail = {
      coverImage: image.value.coverImage,
      coverImagePrompt: image.value.coverImagePrompt,
    };
    steps.push(image.step);
    article = image.value;
    result.article = article;

    const review = await timed("reviewer", "Reviewer Agent", () =>
      runReviewerAgent(article)
    );
    review.step.summary = `Score ${review.value.score}/100 · ${review.value.passed ? "passed" : "needs work"}`;
    review.step.detail = review.value as unknown as Record<string, unknown>;
    steps.push(review.step);
    result.review = review.value;

    if (requireReviewPass && !review.value.passed && publish) {
      steps.push({
        id: "publisher",
        label: "Publisher Agent",
        status: "skipped",
        summary: "Blocked — review did not pass. Saved as draft instead.",
      });
      const draft = await runPublisherAgent({
        authorId: input.authorId,
        categorySlug: input.categorySlug,
        topic: input.topic,
        article,
        publish: false,
      });
      result.blog = draft;
      result.ok = true;
      result.error = "Review gate failed — published as draft for manual edit.";
      return result;
    }

    const publisher = await timed("publisher", "Publisher Agent", () =>
      runPublisherAgent({
        authorId: input.authorId,
        categorySlug: input.categorySlug,
        topic: input.topic,
        article,
        publish,
      })
    );
    publisher.step.summary = `${publisher.value.status} · /blog/${publisher.value.slug}`;
    publisher.step.detail = publisher.value as unknown as Record<string, unknown>;
    steps.push(publisher.step);
    result.blog = publisher.value;
    result.ok = true;
    return result;
  } catch (thrown) {
    const failedStep = (thrown as { step?: PipelineStepResult })?.step;
    if (failedStep) steps.push(failedStep);
    result.error =
      failedStep?.error ||
      (thrown instanceof Error ? thrown.message : "Pipeline failed");
    return result;
  }
}
