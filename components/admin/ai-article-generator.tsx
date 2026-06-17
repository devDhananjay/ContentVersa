"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  Flame,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/data/categories";

type HotTopic = {
  title: string;
  searchIntent: string;
  whyTrending: string;
};

export function AiArticleGenerator() {
  const [category, setCategory] = React.useState(CATEGORIES[0]?.slug ?? "technology");
  const [topics, setTopics] = React.useState<HotTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = React.useState(false);
  const [generating, setGenerating] = React.useState<string | null>(null);
  const [lastPublished, setLastPublished] = React.useState<{
    slug: string;
    title: string;
    id: string;
  } | null>(null);

  const loadTopics = async () => {
    setLoadingTopics(true);
    setTopics([]);
    try {
      const res = await fetch(
        `/api/admin/ai-articles?category=${encodeURIComponent(category)}`,
        { credentials: "include" }
      );
      const data = (await res.json()) as {
        topics?: HotTopic[];
        error?: string;
        source?: "gemini" | "fallback";
        warning?: string;
      };
      if (!res.ok) {
        toast.error(data.error || "Could not load hot topics");
        return;
      }
      setTopics(data.topics ?? []);
      if (!data.topics?.length) {
        toast.error("No topics available — check GEMINI_API_KEY or try later");
        return;
      }
      if (data.source === "fallback" && data.warning) {
        toast.message(data.warning);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoadingTopics(false);
    }
  };

  const generate = async (topic: HotTopic) => {
    setGenerating(topic.title);
    try {
      const res = await fetch("/api/admin/ai-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category,
          title: topic.title,
          searchIntent: topic.searchIntent,
          publish: true,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        blog?: { id: string; slug: string; title: string; readingTime: number };
      };
      if (!res.ok) {
        toast.error(data.error || "Generation failed");
        return;
      }
      if (data.blog) {
        setLastPublished(data.blog);
        toast.success(`Published: ${data.blog.title}`, {
          description: `${data.blog.readingTime} min read`,
        });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-violet-500/5 p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:max-w-xs">
                <SelectValue placeholder="Pick category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="gradient"
            className="gap-2"
            disabled={loadingTopics}
            onClick={loadTopics}
          >
            {loadingTopics ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Flame className="h-4 w-4" />
            )}
            Load hot topics
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Gemini suggests trending angles for India today. Articles are ~3–5 min read.
          Click <strong>Generate &amp; publish</strong> on any topic.
        </p>
      </div>

      {lastPublished && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 flex flex-wrap items-center gap-3">
          <Sparkles className="h-5 w-5 text-green-600" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{lastPublished.title}</p>
            <p className="text-xs text-muted-foreground">Just published</p>
          </div>
          <Link href={`/blog/${lastPublished.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5">
              View <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
          <Link href={`/admin/blogs/${lastPublished.id}`}>
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
        </div>
      )}

      {topics.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Hot topics</h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={loadTopics}
              disabled={loadingTopics}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
          {topics.map((topic) => (
            <div
              key={topic.title}
              className="rounded-2xl border bg-card p-5 flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="secondary">{category}</Badge>
                  <Badge variant="outline" className="text-orange-600 border-orange-500/40">
                    Trending
                  </Badge>
                </div>
                <h3 className="font-semibold text-base leading-snug">{topic.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{topic.whyTrending}</p>
              </div>
              <Button
                type="button"
                variant="gradient"
                className="gap-2 shrink-0"
                disabled={generating !== null}
                onClick={() => generate(topic)}
              >
                {generating === topic.title ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate &amp; publish
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        !loadingTopics && (
          <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
            <Flame className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Pick a category and load hot topics to get started.</p>
          </div>
        )
      )}
    </div>
  );
}
