"use client";

import * as React from "react";
import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Optional Gemini Hindi draft — hidden unless ENABLE_AI_HI_TRANSLATE=1 (free mode default off).
 */
export function GenerateHindiButton({
  slug,
  disabled,
}: {
  slug?: string | null;
  disabled?: boolean;
}) {
  const [enabled, setEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/i18n/config")
      .then((r) => r.json())
      .then((d: { aiHiTranslate?: boolean }) => {
        if (!cancelled) setEnabled(!!d.aiHiTranslate);
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!slug || !enabled) return null;

  const run = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(slug)}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage(data.message || "Hindi draft saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-1.5 text-xs"
        disabled={disabled || loading}
        onClick={run}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Languages className="h-3.5 w-3.5" />
        )}
        Generate Hindi draft
      </Button>
      {message ? (
        <p className="text-[11px] text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
