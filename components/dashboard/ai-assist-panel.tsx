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
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isFullBlogPackage } from "@/components/dashboard/try-with-ai-button";
import type { FullBlogPackage } from "@/lib/ai/full-blog-package";
import type { AiBlogPermissionStatus } from "@/lib/auth/blog-permissions-shared";

type Props = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  canUseAiBlog?: boolean;
  aiBlogPermission?: AiBlogPermissionStatus;
  onAiPermissionChange?: (next: {
    aiBlogPermission: AiBlogPermissionStatus;
    canUseAiBlog: boolean;
  }) => void;
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
  canUseAiBlog = false,
  aiBlogPermission = "NONE",
  onAiPermissionChange,
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
  const [requesting, setRequesting] = React.useState(false);

  const requestAccess = async () => {
    setRequesting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/me/ai-blog-permission", { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        aiBlogPermission?: AiBlogPermissionStatus;
        canUseAiBlog?: boolean;
      };
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (data.aiBlogPermission) {
        onAiPermissionChange?.({
          aiBlogPermission: data.aiBlogPermission,
          canUseAiBlog: !!data.canUseAiBlog,
        });
      }
      setMessage(data.message || "Request sent to admin.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setRequesting(false);
    }
  };

  const run = async (
    action: string,
    apply?: (result: string | string[]) => void
  ) => {
    const isFullWrite = action === "generate-from-title" || action === "expand-thesis";
    if (isFullWrite && !canUseAiBlog) {
      setMessage("AI blog writing needs admin permission.");
      return;
    }
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
        code?: string;
      };
      if (!res.ok) {
        if (data.code === "AI_BLOG_FORBIDDEN") {
          throw new Error(data.error || "AI blog permission required");
        }
        if (data.code === "GEMINI_QUOTA") {
          throw new Error(
            data.error ||
              "Gemini quota exceeded for today. Enable billing in Google AI Studio or try again tomorrow."
          );
        }
        throw new Error(data.error || "Failed");
      }

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
      needsAiWrite: true,
      onClick: () => run("generate-from-title"),
    },
    {
      label: "Summarize draft",
      icon: FileText,
      action: "summarize",
      needsAiWrite: false,
      onClick: () =>
        run("summarize", (r) =>
          onApplyExcerpt?.(typeof r === "string" ? r : "")
        ),
    },
    {
      label: "SEO title",
      icon: Search,
      action: "seo-title",
      needsAiWrite: false,
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
      needsAiWrite: false,
      onClick: () => run("blog-ideas"),
    },
    {
      label: "Generate excerpt",
      icon: Wand2,
      action: "excerpt",
      needsAiWrite: false,
      onClick: () =>
        run("excerpt", (r) =>
          onApplyExcerpt?.(typeof r === "string" ? r : "")
        ),
    },
    {
      label: "Suggest tags",
      icon: Tags,
      action: "tags",
      needsAiWrite: false,
      onClick: () =>
        run("tags", (r) => {
          if (Array.isArray(r)) onApplyTags?.(r);
        }),
    },
    {
      label: "Expand thesis",
      icon: Sparkles,
      action: "expand-thesis",
      needsAiWrite: true,
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

      {!canUseAiBlog ? (
        <div className="mb-4 rounded-xl border border-dashed bg-muted/40 p-3 space-y-2">
          <p className="text-xs font-medium flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Full AI blog writing is permission-based
          </p>
          <p className="text-xs text-muted-foreground">
            {aiBlogPermission === "REQUESTED"
              ? "Your request is pending admin approval. Helpers below still work."
              : aiBlogPermission === "DENIED"
                ? "AI blog access was denied. You can still write manually and use light helpers."
                : "Request access to generate full blogs with AI. Light helpers stay available."}
          </p>
          {aiBlogPermission !== "REQUESTED" && aiBlogPermission !== "GRANTED" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full gap-1.5 text-xs"
              disabled={requesting}
              onClick={requestAccess}
            >
              {requesting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Request AI blog access
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-1.5">
        {tools.map((t) => {
          const locked = t.needsAiWrite && !canUseAiBlog;
          return (
            <Button
              key={t.action}
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs gap-2"
              disabled={!!loading || locked}
              onClick={t.onClick}
              title={locked ? "Requires AI blog permission" : undefined}
            >
              {loading === t.action ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : locked ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <t.icon className="h-3.5 w-3.5" />
              )}
              {t.label}
            </Button>
          );
        })}
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
