"use client";

import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FullBlogPackage } from "@/lib/ai/full-blog-package";

type AiContext = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
};

type Props = {
  action: string;
  context: AiContext;
  onResult: (result: string | string[]) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  size?: "sm" | "default";
};

export function TryWithAiButton({
  action,
  context,
  onResult,
  disabled,
  className,
  label = "Try with AI",
  size = "sm",
}: Props) {
  const [loading, setLoading] = React.useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...context }),
      });
      const data = (await res.json()) as {
        result?: string | string[] | FullBlogPackage;
        blog?: FullBlogPackage;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "AI failed");

      if (action === "generate-from-title" && data.blog) {
        throw new Error("Use full blog generator for this action");
      }

      const result = data.result;
      if (typeof result === "string" || Array.isArray(result)) {
        onResult(result);
      } else if (result && typeof result === "object" && "content" in result) {
        onResult(result.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      disabled={disabled || loading}
      onClick={run}
      className={cn(
        "h-auto py-1 px-2 text-xs gap-1 text-neon-purple hover:text-neon-purple hover:bg-neon-purple/10",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {label}
    </Button>
  );
}

export function isFullBlogPackage(v: unknown): v is FullBlogPackage {
  return (
    typeof v === "object" &&
    v !== null &&
    "content" in v &&
    typeof (v as FullBlogPackage).content === "string"
  );
}
