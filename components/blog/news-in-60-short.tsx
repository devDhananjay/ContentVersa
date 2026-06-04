"use client";

import * as React from "react";
import { Sparkles, Loader2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  cn,
  countWords,
  formatShortDate,
  SHORTS_SLOGAN_WORDS,
  SHORTS_SUMMARY_MIN_WORDS,
} from "@/lib/utils";
import Image from "next/image";
import { shouldSkipImageOptimization } from "@/lib/upload";

type Props = {
  blogSlug: string;
  headline: string;
  coverImage: string;
  authorName: string;
  publishedAt: string;
  content: string;
  excerpt?: string;
  category?: string;
  className?: string;
};

export function NewsIn60Short({
  blogSlug,
  headline,
  coverImage,
  authorName,
  publishedAt,
  content,
  excerpt,
  category,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [summary, setSummary] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [source, setSource] = React.useState<string | null>(null);
  const [targetMin, setTargetMin] = React.useState(SHORTS_SUMMARY_MIN_WORDS);
  const [articleWords, setArticleWords] = React.useState<number | null>(null);

  const generate = async () => {
    setOpen(true);
    if (summary || loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/blogs/${encodeURIComponent(blogSlug)}/summary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: headline,
            excerpt,
            content: content.slice(0, 14000),
            category,
          }),
        }
      );
      const data = (await res.json()) as {
        summary?: string;
        source?: string;
        targetWords?: { min?: number };
        articleWords?: number;
      };
      if (data.summary) {
        setSummary(data.summary);
        setSource(data.source || null);
        setTargetMin(data.targetWords?.min ?? SHORTS_SUMMARY_MIN_WORDS);
        setArticleWords(
          typeof data.articleWords === "number" ? data.articleWords : null
        );
      } else throw new Error("No summary");
    } catch {
      setSummary(null);
      setSource(null);
    } finally {
      setLoading(false);
    }
  };

  const coverSrc =
    coverImage ||
    "https://images.unsplash.com/photo-1504711434966-e33886168f5c?w=800&q=80";
  const wordCount = summary ? countWords(summary) : 0;

  return (
    <div className={cn("relative z-10", className)}>
      {!open ? (
        <div className="rounded-2xl border border-neon-cyan/25 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 p-5 max-w-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-neon-cyan flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                News in {SHORTS_SLOGAN_WORDS} words
              </p>
              <p className="font-display font-semibold mt-1 text-foreground">
                ~{SHORTS_SUMMARY_MIN_WORDS}-word AI digest in one read
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Thesis, bullets, quote &amp; takeaway — slogan stays &quot;60 words&quot;
              </p>
            </div>
            <Button
              type="button"
              variant="gradient"
              size="sm"
              className="gap-2 shrink-0"
              onClick={generate}
            >
              <Sparkles className="h-4 w-4" />
              Summarize with AI
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl max-w-xl mx-auto w-full">
          <div className="relative h-32 sm:h-36 bg-zinc-900 shrink-0">
            <Image
              src={coverSrc}
              alt={headline}
              fill
              className="object-cover"
              sizes="576px"
              unoptimized={shouldSkipImageOptimization(coverSrc)}
            />
          </div>

          <div className="bg-black text-white px-5 py-6 flex flex-col max-h-[min(82vh,640px)]">
            <p className="text-xs font-bold uppercase tracking-widest text-neon-cyan mb-2 shrink-0">
              News in {SHORTS_SLOGAN_WORDS} words
            </p>
            {loading ? (
              <div className="flex items-center gap-2 text-white/50 text-sm py-8">
                <Loader2 className="h-5 w-5 animate-spin" />
                Writing full summary…
              </div>
            ) : summary ? (
              <div className="overflow-y-auto flex-1 pr-1 -mr-1 min-h-[200px] max-h-[min(68vh,520px)]">
                <p className="text-[15px] sm:text-base leading-[1.75] text-white/92 whitespace-pre-wrap">
                  {summary}
                </p>
              </div>
            ) : (
              <p className="text-sm text-rose-300 py-4">
                Summary failed. Check GEMINI_API_KEY in .env and try again.
              </p>
            )}

            <p className="text-xs text-white/45 mt-4 pt-3 border-t border-white/10 shrink-0">
              short by {authorName} / {formatShortDate(publishedAt)}
              {summary && !loading && (
                <span className="text-white/30">
                  {" "}
                  · {wordCount} word digest
                  {wordCount < targetMin ? " (loading more detail…)" : ""}
                  {articleWords != null ? ` · article ${articleWords}w` : ""}
                  {source === "gemini" ? " · Gemini" : source ? ` · ${source}` : ""}
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
