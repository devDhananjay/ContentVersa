import { Reactions } from "@/components/blog/reactions";
import { ArticleFeedback } from "@/components/blog/article-feedback";
import { PollWidget } from "@/components/blog/poll-widget";
import { Comments } from "@/components/blog/comments";
import type { ReactionTypeKey } from "@/lib/data/blog-engagement";

interface FeedArticleEngagementProps {
  discoverSlug: string;
  title: string;
  category: string;
  blogId?: string;
  initialReactions?: number;
  initialComments?: number;
  initialUserReaction?: ReactionTypeKey | null;
}

export function FeedArticleEngagement({
  discoverSlug,
  title,
  category,
  blogId,
  initialReactions = 0,
  initialComments = 0,
  initialUserReaction = null,
}: FeedArticleEngagementProps) {
  return (
    <div className="mt-10 pt-8 border-t border-border/60">
      <Reactions
        blogRef={discoverSlug}
        initialCount={initialReactions}
        initialUserReaction={initialUserReaction}
      />

      <div className="mt-8">
        <ArticleFeedback blogSlug={discoverSlug} />
      </div>

      <div className="mt-14">
        <PollWidget
          className="mb-10"
          blogContext={{
            blogSlug: discoverSlug,
            blogId,
            title,
            category,
          }}
        />
      </div>

      <div id="comments" className="mt-14">
        <h2 className="font-display text-2xl font-bold mb-6">Discussion</h2>
        <Comments blogSlug={discoverSlug} initialCount={initialComments} />
      </div>
    </div>
  );
}
