"use client";

import * as React from "react";
import { BarChart3, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthorActions } from "@/components/blog/author-actions";

function blogPollSlug(blogSlug: string) {
  return `blog-${blogSlug}`;
}

type PollOption = {
  id: string;
  label: string;
  votes: number;
  percent: number;
};

type PollData = {
  slug: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVoteOptionId: string | null;
};

export function PollWidget({
  pollSlug = "ai-replace-jobs",
  blogContext,
  inlinePoll,
  author,
  className,
}: {
  pollSlug?: string;
  blogContext?: {
    blogSlug: string;
    blogId?: string;
    title: string;
    category?: string;
    tags?: string[];
    excerpt?: string;
  };
  /** Writer-inserted poll — creates on first load via API. */
  inlinePoll?: { question: string; options: string[] };
  author?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
    followers?: number;
  };
  className?: string;
}) {
  const slug = blogContext ? blogPollSlug(blogContext.blogSlug) : pollSlug;

  const [poll, setPoll] = React.useState<PollData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [voting, setVoting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (blogContext) {
        params.set("title", blogContext.title);
        if (blogContext.category) params.set("category", blogContext.category);
        if (blogContext.tags?.length) params.set("tags", blogContext.tags.join(","));
        if (blogContext.blogId) params.set("blogId", blogContext.blogId);
      }
      if (inlinePoll) {
        params.set("question", inlinePoll.question);
        params.set("options", inlinePoll.options.join("|"));
      }
      const qs = params.toString();
      const res = await fetch(`/api/polls/${slug}${qs ? `?${qs}` : ""}`, {
        credentials: "include",
      });
      const data = (await res.json()) as { poll?: PollData };
      if (data.poll) setPoll(data.poll);
    } finally {
      setLoading(false);
    }
  }, [
    slug,
    blogContext?.blogSlug,
    blogContext?.title,
    blogContext?.category,
    blogContext?.blogId,
    blogContext?.tags?.join(","),
    inlinePoll?.question,
    inlinePoll?.options?.join("|"),
  ]);

  React.useEffect(() => {
    load();
  }, [load]);

  const vote = async (optionId: string) => {
    setVoting(true);
    try {
      const res = await fetch(`/api/polls/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ optionId }),
      });
      const data = (await res.json()) as { poll?: PollData };
      if (data.poll) setPoll(data.poll);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("rounded-2xl border bg-card p-6 flex justify-center", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!poll) return null;

  const hasVoted = Boolean(poll.userVoteOptionId);

  return (
    <div
      className={cn(
        "rounded-2xl border border-neon-purple/20 bg-gradient-to-br from-neon-purple/5 to-neon-cyan/5 p-6",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-neon-purple" />
        <span className="text-xs font-bold uppercase tracking-widest text-neon-purple">
          Quick poll
        </span>
      </div>
      <p className="font-display text-lg font-bold mb-4">{poll.question}</p>

      <div className="space-y-2">
        {poll.options.map((opt) => {
          const selected = poll.userVoteOptionId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={voting}
              onClick={() => !hasVoted && vote(opt.id)}
              className={cn(
                "w-full text-left rounded-xl border px-4 py-3 transition-all relative overflow-hidden",
                hasVoted
                  ? "cursor-default"
                  : "hover:border-neon-purple/50 hover:bg-card",
                selected && "border-neon-purple ring-1 ring-neon-purple/30"
              )}
            >
              {hasVoted && (
                <div
                  className="absolute inset-y-0 left-0 bg-neon-purple/15 transition-all"
                  style={{ width: `${opt.percent}%` }}
                />
              )}
              <div className="relative flex items-center justify-between gap-2">
                <span className="font-medium text-sm flex items-center gap-2">
                  {selected && <Check className="h-4 w-4 text-neon-purple" />}
                  {opt.label}
                </span>
                {hasVoted && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {opt.percent}% · {opt.votes}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        {poll.totalVotes.toLocaleString()} votes
        {!hasVoted && " · Tap to vote"}
      </p>

      {author && (
        <div className="mt-6 pt-5 border-t border-border/60">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Written by
          </p>
          <AuthorActions
            id={author.id}
            name={author.name}
            username={author.username}
            avatar={author.avatar}
            verified={author.verified}
            followers={author.followers}
            avatarSize="sm"
            layout="row"
          />
        </div>
      )}
    </div>
  );
}
