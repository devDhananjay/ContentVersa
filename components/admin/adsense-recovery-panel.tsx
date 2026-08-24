"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AdsenseRecoveryPanel() {
  const [thin, setThin] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [working, setWorking] = React.useState(false);

  const load = React.useCallback(() => {
    fetch("/api/admin/adsense-recovery")
      .then((r) => r.json())
      .then((d) => setThin(typeof d.thinPublished === "number" ? d.thinPublished : 0))
      .catch(() => setThin(0))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const archive = async () => {
    const n = thin ?? 0;
    const ok = window.confirm(
      `Archive ${n} thin/syndicated/AI-volume published post(s)? They leave the public site and sitemap. Daily AI auto-gen will also pause. This cannot be easily undone.`
    );
    if (!ok) return;
    setWorking(true);
    try {
      const res = await fetch("/api/admin/adsense-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(`Archived ${data.archived ?? 0} posts. Auto-gen paused.`);
      setThin(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">AdSense: low-value content</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Google reviews unique editorial depth — not ad slots. Pause nightly AI,
            keep only 4+ min original posts on the public site, then request review
            after Search Console shows those URLs dropping out of the index.
          </p>
        </div>
      </div>
      {loading ? (
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking published thin posts…
        </p>
      ) : (
        <p className="text-sm">
          Thin / discover / nightly-AI posts still <strong>published</strong>:{" "}
          <span className="font-mono">{thin}</span>
        </p>
      )}
      <Button
        variant="destructive"
        size="sm"
        disabled={working || loading || !thin}
        onClick={archive}
      >
        {working ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Archive thin published posts
      </Button>
    </div>
  );
}
