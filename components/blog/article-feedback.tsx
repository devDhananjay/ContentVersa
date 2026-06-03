"use client";

import * as React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ArticleFeedback({ blogSlug }: { blogSlug: string }) {
  const [stats, setStats] = React.useState<{
    helpful: number;
    notHelpful: number;
    userVote: boolean | null;
  }>({ helpful: 0, notHelpful: 0, userVote: null });
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const apiSlug = encodeURIComponent(blogSlug);

  React.useEffect(() => {
    fetch(`/api/blogs/${apiSlug}/feedback`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setStats({
            helpful: d.helpful ?? 0,
            notHelpful: d.notHelpful ?? 0,
            userVote: d.userVote ?? null,
          });
        }
      })
      .catch(() => {});
  }, [apiSlug]);

  const vote = async (helpful: boolean) => {
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/blogs/${apiSlug}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ helpful }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not save feedback");
        return;
      }
      setStats({
        helpful: data.helpful ?? 0,
        notHelpful: data.notHelpful ?? 0,
        userVote: data.userVote ?? helpful,
      });
      setMessage("Thanks for your feedback!");
    } catch {
      setMessage("Network error — try again");
    } finally {
      setSubmitting(false);
    }
  };

  const voted = stats.userVote !== null;

  return (
    <div className="relative z-20 rounded-2xl border bg-card p-6 text-center pointer-events-auto">
      <p className="font-display text-lg font-bold">Was this helpful?</p>
      <p className="text-sm text-muted-foreground mt-1 mb-5">
        Your feedback helps us improve content for everyone.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            vote(true);
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all cursor-pointer",
            stats.userVote === true
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "hover:border-emerald-500/40 hover:bg-emerald-500/5"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          Yes
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            vote(false);
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all cursor-pointer",
            stats.userVote === false
              ? "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : "hover:border-rose-500/40 hover:bg-rose-500/5"
          )}
        >
          <ThumbsDown className="h-4 w-4" />
          No
        </button>
      </div>
      {message && (
        <p className="text-xs text-muted-foreground mt-4">{message}</p>
      )}
      {voted && !message && (
        <p className="text-xs text-muted-foreground mt-4">
          {stats.helpful + stats.notHelpful} readers responded
        </p>
      )}
    </div>
  );
}
