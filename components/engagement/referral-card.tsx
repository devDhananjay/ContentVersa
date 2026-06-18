"use client";

import * as React from "react";
import { Copy, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReferralCard() {
  const [url, setUrl] = React.useState<string | null>(null);
  const [code, setCode] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/me/referral", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { url?: string; code?: string } | null) => {
        if (data?.url) setUrl(data.url);
        if (data?.code) setCode(data.code);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!url || !code) return null;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="h-5 w-5 text-neon-purple" />
        <h2 className="font-display text-lg font-bold">Invite friends</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Share your link — when a friend joins, you both get +1 streak day.
      </p>
      <div className="flex gap-2">
        <Input readOnly value={url} className="text-xs" />
        <Button type="button" variant="outline" size="icon" onClick={copy} aria-label="Copy link">
          <Copy className={`h-4 w-4 ${copied ? "text-green-500" : ""}`} />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Your code: {code}</p>
    </div>
  );
}
