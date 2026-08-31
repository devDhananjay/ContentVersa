"use client";

import * as React from "react";
import { Clapperboard, Loader2, Power, Save } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CategoryRow = {
  slug: string;
  name: string;
  alwaysOn: boolean;
};

export function AiAutoGenToggle() {
  const [enabled, setEnabled] = React.useState<boolean | null>(null);
  const [categories, setCategories] = React.useState<CategoryRow[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [activeCount, setActiveCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState(false);
  const [savingCats, setSavingCats] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await fetch("/api/admin/ai-auto-gen");
    const d = (await res.json()) as {
      enabled?: boolean;
      categorySlugs?: string[];
      activeCategorySlugs?: string[];
      categories?: CategoryRow[];
    };
    setEnabled(d.enabled ?? false);
    setCategories(d.categories ?? []);
    setSelected(new Set(d.categorySlugs ?? []));
    setActiveCount(d.activeCategorySlugs?.length ?? 0);
    setDirty(false);
  }, []);

  React.useEffect(() => {
    load()
      .catch(() => {
        setEnabled(false);
        toast.error("Could not load AI scheduling settings");
      })
      .finally(() => setLoading(false));
  }, [load]);

  const toggleEnabled = async (val: boolean) => {
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
      setActiveCount(data.activeCategorySlugs?.length ?? activeCount);
      toast.success(
        val
          ? `Daily AI drafts scheduled for ${data.activeCategorySlugs?.length ?? activeCount} categories`
          : "Daily AI scheduling paused"
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not toggle");
    } finally {
      setToggling(false);
    }
  };

  const toggleCategory = (slug: string, alwaysOn: boolean) => {
    if (alwaysOn) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setDirty(true);
  };

  const saveCategories = async () => {
    setSavingCats(true);
    try {
      const res = await fetch("/api/admin/ai-auto-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorySlugs: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setActiveCount(data.activeCategorySlugs?.length ?? 0);
      setDirty(false);
      toast.success(`Categories saved — ${data.activeCategorySlugs?.length ?? 0} active (incl. Movies)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save categories");
    } finally {
      setSavingCats(false);
    }
  };

  const selectAllOptional = () => {
    setSelected(new Set(categories.filter((c) => !c.alwaysOn).map((c) => c.slug)));
    setDirty(true);
  };

  const clearOptional = () => {
    setSelected(new Set());
    setDirty(true);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Power className={`h-5 w-5 ${enabled ? "text-emerald-500" : "text-muted-foreground"}`} />
          <div>
            <p className="font-medium text-sm">Daily AI draft scheduling</p>
            <p className="text-xs text-muted-foreground">
              {enabled
                ? `Cron creates DRAFT articles for ${activeCount} categories (IST nightly).`
                : "Paused — cron skips generation until you turn this on."}
            </p>
          </div>
        </div>
        <Switch
          checked={enabled ?? false}
          onCheckedChange={toggleEnabled}
          disabled={toggling}
          aria-label="Toggle daily AI draft scheduling"
        />
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Categories to auto-create</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pick which categories get nightly Google News drafts. Cover image + publish stays manual.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={selectAllOptional}>
              Select all
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={clearOptional}>
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => void saveCategories()}
              disabled={savingCats || !dirty}
            >
              {savingCats ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {categories.map((cat) => {
            const checked = cat.alwaysOn || selected.has(cat.slug);
            return (
              <label
                key={cat.slug}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors",
                  checked ? "border-neon-purple/40 bg-neon-purple/5" : "border-border/60 hover:bg-muted/40",
                  cat.alwaysOn && "cursor-default"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={cat.alwaysOn}
                  onChange={() => toggleCategory(cat.slug, cat.alwaysOn)}
                  className="h-4 w-4 rounded border-input accent-neon-purple"
                />
                <span className="flex-1 min-w-0 truncate font-medium">{cat.name}</span>
                {cat.alwaysOn ? (
                  <span className="inline-flex items-center gap-1 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    <Clapperboard className="h-3 w-3" />
                    Always on
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground rounded-lg bg-muted/40 px-3 py-2">
          <strong>Movies</strong> stays enabled for OTT / new release posts (high traffic). Turn scheduling ON above
          to keep movie & series drafts flowing nightly.
        </p>
      </div>
    </div>
  );
}
