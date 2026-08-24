"use client";

import * as React from "react";
import { Power, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export function AiAutoGenToggle() {
  const [enabled, setEnabled] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/admin/ai-auto-gen")
      .then((r) => r.json())
      .then((d) => setEnabled(d.enabled ?? true))
      .catch(() => setEnabled(true))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (val: boolean) => {
    setToggling(true);
    try {
      const res = await fetch("/api/admin/ai-auto-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setEnabled(val);
      toast.success(val ? "AI auto-generation started" : "AI auto-generation paused");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not toggle");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <Power className={`h-5 w-5 ${enabled ? "text-emerald-500" : "text-muted-foreground"}`} />
        <div>
          <p className="font-medium text-sm">
            Daily AI article generation
          </p>
          <p className="text-xs text-muted-foreground">
            {enabled
              ? "Cron will auto-generate articles on schedule."
              : "Paused — cron will skip generation until you re-enable."}
          </p>
        </div>
      </div>
      <Switch
        checked={enabled ?? false}
        onCheckedChange={toggle}
        disabled={toggling}
        aria-label="Toggle AI auto-generation"
      />
    </div>
  );
}
