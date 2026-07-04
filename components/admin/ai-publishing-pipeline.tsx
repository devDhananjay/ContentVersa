"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Loader2,
  Search,
  PenLine,
  LineChart,
  ImageIcon,
  ShieldCheck,
  Upload,
  CheckCircle2,
  XCircle,
  Circle,
  ExternalLink,
  Pencil,
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
import type {
  PipelineRunResult,
  PipelineStepResult,
  ResearchTopic,
} from "@/lib/seo/pipeline/types";

const STEP_META: {
  id: PipelineStepResult["id"];
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "research", label: "Research", icon: Search },
  { id: "writer", label: "Writer", icon: PenLine },
  { id: "seo", label: "SEO", icon: LineChart },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "reviewer", label: "Reviewer", icon: ShieldCheck },
  { id: "publisher", label: "Publisher", icon: Upload },
];

function StepIcon({ status }: { status: PipelineStepResult["status"] }) {
  if (status === "running") return <Loader2 className="h-4 w-4 animate-spin text-orange-500" />;
  if (status === "done") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "failed") return <XCircle className="h-4 w-4 text-destructive" />;
  if (status === "skipped") return <Circle className="h-4 w-4 text-muted-foreground" />;
  return <Circle className="h-4 w-4 text-muted-foreground/50" />;
}

function competitionVariant(c: ResearchTopic["competition"]) {
  if (c === "low") return "success" as const;
  if (c === "medium") return "warning" as const;
  return "destructive" as const;
}

export function AiPublishingPipeline() {
  const [category, setCategory] = React.useState(CATEGORIES[0]?.slug ?? "technology");
  const [topics, setTopics] = React.useState<ResearchTopic[]>([]);
  const [loadingResearch, setLoadingResearch] = React.useState(false);
  const [runningTitle, setRunningTitle] = React.useState<string | null>(null);
  const [steps, setSteps] = React.useState<PipelineStepResult[]>([]);
  const [result, setResult] = React.useState<PipelineRunResult | null>(null);

  const runResearch = async () => {
    setLoadingResearch(true);
    setTopics([]);
    setResult(null);
    setSteps([]);
    try {
      const res = await fetch("/api/admin/ai-articles/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "research", category, count: 6 }),
      });
      const data = (await res.json()) as {
        topics?: ResearchTopic[];
        error?: string;
        warning?: string;
      };
      if (!res.ok) {
        toast.error(data.error || "Research failed");
        return;
      }
      setTopics(data.topics ?? []);
      if (data.warning) toast.message(data.warning);
      toast.success(`${data.topics?.length ?? 0} topics scored`);
    } catch {
      toast.error("Network error");
    } finally {
      setLoadingResearch(false);
    }
  };

  const runPipeline = async (topic: ResearchTopic, publish: boolean) => {
    setRunningTitle(topic.title);
    setResult(null);
    setSteps(
      STEP_META.map((s) => ({
        id: s.id,
        label: `${s.label} Agent`,
        status: s.id === "research" ? "done" : "pending",
        summary:
          s.id === "research"
            ? `SEO ${topic.seoScore}/100 · ${topic.competition} competition`
            : undefined,
      }))
    );

    // Optimistic progress animation while server runs full pipeline
    const progressIds: PipelineStepResult["id"][] = [
      "writer",
      "seo",
      "image",
      "reviewer",
      "publisher",
    ];
    let i = 0;
    const tick = window.setInterval(() => {
      if (i >= progressIds.length) return;
      const id = progressIds[i++];
      setSteps((prev) =>
        prev.map((s) =>
          s.id === id && s.status === "pending" ? { ...s, status: "running" } : s
        )
      );
    }, 1800);

    try {
      const res = await fetch("/api/admin/ai-articles/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "run",
          category,
          topic,
          publish,
          requireReviewPass: true,
        }),
      });
      const data = (await res.json()) as PipelineRunResult & { error?: string };
      window.clearInterval(tick);
      if (!res.ok && !data.steps) {
        toast.error(data.error || "Pipeline failed");
        return;
      }
      setResult(data);
      setSteps(data.steps ?? []);
      if (data.ok && data.blog) {
        toast.success(
          data.blog.status === "PUBLISHED"
            ? "Published via multi-agent pipeline"
            : "Draft saved — review before publishing"
        );
      } else if (data.error) {
        toast.message(data.error);
      }
    } catch {
      window.clearInterval(tick);
      toast.error("Network error");
    } finally {
      setRunningTitle(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-card p-5 md:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">AI Publishing Pipeline</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Multi-agent workflow: Research → Writer → SEO → Image → Reviewer → Publisher.
              Topics are ranked by SEO score and competition.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
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
            className="gap-1.5"
            disabled={loadingResearch || !!runningTitle}
            onClick={runResearch}
          >
            {loadingResearch ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Step 1: Topic generation
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEP_META.map((s) => {
            const live = steps.find((x) => x.id === s.id);
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className={cn(
                  "rounded-xl border px-3 py-2 text-center",
                  live?.status === "running" && "border-orange-500/40 bg-orange-500/5",
                  live?.status === "done" && "border-emerald-500/30 bg-emerald-500/5",
                  live?.status === "failed" && "border-destructive/40 bg-destructive/5"
                )}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <StepIcon status={live?.status ?? "pending"} />
                </div>
                <p className="text-[11px] font-medium">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {topics.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg">Ranked topics</h3>
          {topics.map((topic) => {
            const busy = runningTitle === topic.title;
            return (
              <div
                key={topic.title}
                className="rounded-2xl border bg-card p-4 md:p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neon">SEO {topic.seoScore}</Badge>
                  <Badge variant={competitionVariant(topic.competition)}>
                    {topic.competition} competition
                  </Badge>
                  {topic.keywords.slice(0, 3).map((k) => (
                    <Badge key={k} variant="secondary" className="text-[10px]">
                      {k}
                    </Badge>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold leading-snug">{topic.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{topic.whyTrending}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Intent: {topic.searchIntent}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!!runningTitle}
                    className="gap-1.5"
                    onClick={() => runPipeline(topic, false)}
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PenLine className="h-3.5 w-3.5" />}
                    Run pipeline → Draft
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="gradient"
                    disabled={!!runningTitle}
                    className="gap-1.5"
                    onClick={() => runPipeline(topic, true)}
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    Run pipeline → Publish
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {steps.length > 0 ? (
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <h3 className="font-display font-bold">Agent log</h3>
          <ul className="space-y-2">
            {steps.map((s) => (
              <li
                key={s.id}
                className="flex items-start gap-3 text-sm border-b border-border/40 pb-2 last:border-0"
              >
                <StepIcon status={s.status} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{s.label}</p>
                  {s.summary ? (
                    <p className="text-xs text-muted-foreground mt-0.5">{s.summary}</p>
                  ) : null}
                  {s.error ? (
                    <p className="text-xs text-destructive mt-0.5">{s.error}</p>
                  ) : null}
                </div>
                {typeof s.ms === "number" ? (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {(s.ms / 1000).toFixed(1)}s
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result?.blog ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">{result.blog.status}</Badge>
            {result.review ? (
              <Badge variant="secondary">Review {result.review.score}/100</Badge>
            ) : null}
          </div>
          {result.article?.coverImage ? (
            <div className="relative aspect-[16/7] max-w-md rounded-xl overflow-hidden border">
              <Image
                src={result.article.coverImage}
                alt=""
                fill
                className="object-cover"
                sizes="400px"
                unoptimized={shouldSkipImageOptimization(result.article.coverImage)}
              />
            </div>
          ) : null}
          <p className="font-semibold">{result.article?.title || result.topic.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {result.article?.excerpt}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={result.blog.previewUrl} target="_blank">
              <Button size="sm" variant="outline" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" /> Preview
              </Button>
            </Link>
            <Link href={result.blog.editUrl}>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </Link>
          </div>
          {result.error ? (
            <p className="text-xs text-amber-700 dark:text-amber-300">{result.error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
