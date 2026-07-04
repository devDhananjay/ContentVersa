"use client";

import * as React from "react";
import {
  Sparkles,
  Loader2,
  FileText,
  Search,
  Lightbulb,
  Tags,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isFullBlogPackage } from "@/components/dashboard/try-with-ai-button";
import type { FullBlogPackage } from "@/lib/ai/full-blog-package";

type Props = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  onApplyTitle?: (v: string) => void;
  onApplyExcerpt?: (v: string) => void;
  onApplyTags?: (tags: string[]) => void;
  onApplySeoTitle?: (v: string) => void;
  onApplyContent?: (md: string) => void;
  onApplyFullBlog?: (blog: FullBlogPackage, source?: string) => void;
};

function aiSourceLabel(source?: string) {
  if (source === "gemini") return "Generated with Gemini";
  if (source === "openai") return "Generated with OpenAI";
  return "Smart suggestion (add GEMINI_API_KEY for AI)";
}

export function AiAssistPanel({
  title,
  excerpt,
  content,
  category,
  onApplyTitle,
  onApplyExcerpt,
  onApplyTags,
  onApplySeoTitle,
  onApplyContent,
  onApplyFullBlog,
}: Props) {
  const [loading, setLoading] = React.useState<string | null>(null);
  const [ideas, setIdeas] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState<string | null>(null);

  const run = async (
    action: string,
    apply?: (result: string | string[]) => void
  ) => {
    setLoading(action);
    setMessage(null);
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, title, excerpt, content, category }),
      });
      const data = (await res.json()) as {
        result?: string | string[] | FullBlogPackage;
        blog?: FullBlogPackage;
        source?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Failed");

      if (action === "generate-from-title") {
        const blog = data.blog ?? (isFullBlogPackage(data.result) ? data.result : null);
        if (blog) {
          onApplyFullBlog?.(blog, data.source);
          setMessage(aiSourceLabel(data.source));
          return;
        }
      }

      const result = data.result;
      if (action === "blog-ideas" && Array.isArray(result)) {
        setIdeas(result);
      } else if (apply && typeof result === "string") {
        apply(result);
      }
      setMessage(aiSourceLabel(data.source));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  };

  const tools = [
    {
      label: "Generate full blog",
      icon: Sparkles,
      action: "generate-from-title",
      onClick: () => run("generate-from-title"),
    },
    {
      label: "Summarize draft",
      icon: FileText,
      action: "summarize",
      onClick: () =>
        run("summarize", (r) =>
          onApplyExcerpt?.(typeof r === "string" ? r : "")
        ),
    },
    {
      label: "SEO title",
      icon: Search,
      action: "seo-title",
      onClick: () =>
        run("seo-title", (r) => {
          if (typeof r === "string") {
            onApplySeoTitle?.(r);
            onApplyTitle?.(r);
          }
        }),
    },
    {
      label: "Blog ideas",
      icon: Lightbulb,
      action: "blog-ideas",
      onClick: () => run("blog-ideas"),
    },
    {
      label: "Generate excerpt",
      icon: Wand2,
      action: "excerpt",
      onClick: () =>
        run("excerpt", (r) =>
          onApplyExcerpt?.(typeof r === "string" ? r : "")
        ),
    },
    {
      label: "Suggest tags",
      icon: Tags,
      action: "tags",
      onClick: () =>
        run("tags", (r) => {
          if (Array.isArray(r)) onApplyTags?.(r);
        }),
    },
    {
      label: "Expand thesis",
      icon: Sparkles,
      action: "expand-thesis",
      onClick: () => run("expand-thesis"),
    },
  ];

  return (
    <div className="rounded-2xl border-gradient bg-card p-5">
      <div className="flex items-center gap-2 mb-2 text-neon-purple">
        <Sparkles className="h-4 w-4" />
        <p className="text-xs font-bold uppercase tracking-widest">AI Assist</p>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Full blog, excerpt, SEO, tags & more — fills every field for you.
      </p>

      <div className="space-y-1.5">
        {tools.map((t) => (
          <Button
            key={t.action}
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs gap-2"
            disabled={!!loading}
            onClick={t.onClick}
          >
            {loading === t.action ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <t.icon className="h-3.5 w-3.5" />
            )}
            {t.label}
          </Button>
        ))}
      </div>

      {message && (
        <p className="text-xs text-muted-foreground mt-3">{message}</p>
      )}

      {ideas.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ideas
          </p>
          {ideas.map((idea) => (
            <button
              key={idea}
              type="button"
              className="w-full text-left text-xs rounded-lg border px-3 py-2 hover:bg-muted/50 transition-colors"
              onClick={() => onApplyTitle?.(idea)}
            >
              {idea}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
