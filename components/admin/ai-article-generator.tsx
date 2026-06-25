"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Loader2,
  Flame,
  ExternalLink,
  RefreshCw,
  Eye,
  Pencil,
  CheckCircle2,
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
import { shouldSkipImageOptimization } from "@/lib/upload";
import { cn } from "@/lib/utils";

type HotTopic = {
  title: string;
  searchIntent: string;
  whyTrending: string;
};

type GeneratedBlog = {
  id: string;
  slug: string;
  title: string;
  readingTime: number;
  status: string;
  excerpt?: string;
  coverImage?: string | null;
  previewUrl?: string;
  editUrl?: string;
};

export function AiArticleGenerator() {
  const [category, setCategory] = React.useState(CATEGORIES[0]?.slug ?? "technology");
  const [topics, setTopics] = React.useState<HotTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = React.useState(false);
  const [generating, setGenerating] = React.useState<string | null>(null);
  const [publishing, setPublishing] = React.useState(false);
  const [lastGenerated, setLastGenerated] = React.useState<GeneratedBlog | null>(null);

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
    setLastGenerated(null);
    try {
      const res = await fetch("/api/admin/ai-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category,
          title: topic.title,
          searchIntent: topic.searchIntent,
          publish: false,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        blog?: GeneratedBlog;
      };
      if (!res.ok) {
        const code = (data as { code?: string }).code;
        if (code === "GEMINI_QUOTA") {
          toast.error(data.error || "Gemini quota exceeded", {
            description: "Enable billing in Google AI Studio or try again tomorrow.",
            duration: 8000,
          });
        } else {
          toast.error(data.error || "Generation failed");
        }
        return;
      }
      if (data.blog) {
        setLastGenerated(data.blog);
        toast.success("Draft ready — preview before publishing", {
          description: `${data.blog.readingTime} min read`,
        });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setGenerating(null);
    }
  };

  const publishDraft = async () => {
    if (!lastGenerated || lastGenerated.status === "PUBLISHED") return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/blogs/${lastGenerated.id}/publish`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; blog?: GeneratedBlog };
      if (!res.ok) {
        toast.error(data.error || "Could not publish");
        return;
      }
      setLastGenerated((prev) =>
        prev ? { ...prev, status: "PUBLISHED", slug: data.blog?.slug ?? prev.slug } : prev
      );
      toast.success("Published to site");
    } catch {
      toast.error("Network error");
    } finally {
      setPublishing(false);
    }
  };

  const isPublished = lastGenerated?.status === "PUBLISHED";

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
          Click <strong>Generate draft</strong> — preview and edit before you publish.
        </p>
      </div>

      {lastGenerated && (
        <div
          className={cn(
            "rounded-2xl border p-5 space-y-4",
            isPublished
              ? "border-green-500/30 bg-green-500/5"
              : "border-violet-500/30 bg-violet-500/5"
          )}
        >
          <div className="flex items-start gap-2">
            {isPublished ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant={isPublished ? "success" : "secondary"}>
                  {isPublished ? "Published" : "Draft — preview first"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {lastGenerated.readingTime} min read
                </span>
              </div>
              <h3 className="font-semibold text-base leading-snug">{lastGenerated.title}</h3>
              {lastGenerated.excerpt && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {lastGenerated.excerpt}
                </p>
              )}
            </div>
            {lastGenerated.coverImage && (
              <div className="relative h-20 w-32 shrink-0 rounded-lg overflow-hidden border border-border/60">
                <Image
                  src={lastGenerated.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized={shouldSkipImageOptimization(lastGenerated.coverImage)}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Link href={lastGenerated.previewUrl ?? `/admin/blogs/${lastGenerated.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
            </Link>
            <Link href={lastGenerated.editUrl ?? `/dashboard/blogs/${lastGenerated.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
            {!isPublished && (
              <Button
                type="button"
                variant="gradient"
                size="sm"
                className="gap-1.5"
                disabled={publishing}
                onClick={publishDraft}
              >
                {publishing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Publish now
              </Button>
            )}
            {isPublished && (
              <Link href={`/blog/${lastGenerated.slug}`} target="_blank">
                <Button variant="gradient" size="sm" className="gap-1.5">
                  View live <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
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
                    Generate draft
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
