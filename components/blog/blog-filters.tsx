"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/data/categories";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "trending", label: "Trending" },
  { value: "trending_week", label: "Trending this week" },
  { value: "most_read_today", label: "Most read today" },
  { value: "latest", label: "Latest" },
  { value: "liked", label: "Most Liked" },
  { value: "viewed", label: "Most Viewed" },
  { value: "editor", label: "Editor's Choice" },
];

export function BlogFilters({
  defaultQuery = "",
  defaultCategory = "",
  defaultSort = "trending",
}: {
  defaultQuery?: string;
  defaultCategory?: string;
  defaultSort?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = React.useState(defaultQuery);

  // Keep search box in sync when URL changes (back/forward, chip clears)
  React.useEffect(() => {
    setQ(defaultQuery);
  }, [defaultQuery]);

  const setParams = React.useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(sp?.toString() || "");
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      // Reset page when filters change (keep limit)
      if (!("page" in patch)) next.delete("page");
      const qs = next.toString();
      router.push(qs ? `/blogs?${qs}` : "/blogs");
    },
    [router, sp]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    setQ(trimmed);
    setParams({ q: trimmed || undefined });
  };

  const activeCategory = defaultCategory;
  const activeSort = defaultSort || "trending";

  return (
    <div className="mb-6 space-y-4">
      <form
        onSubmit={onSubmit}
        className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
      >
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles, creators, tags…"
            className="pl-9 h-9 text-sm"
          />
          {q ? (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setParams({ q: undefined });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : null}
        </div>
        <div className="flex gap-2 shrink-0">
          <Select
            value={activeSort}
            onValueChange={(v) => setParams({ sort: v === "trending" ? undefined : v })}
          >
            <SelectTrigger className="w-full sm:w-44 h-9 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" variant="gradient" size="sm" className="gap-1.5 h-9 px-3">
            <Sparkles className="h-3.5 w-3.5" /> Apply
          </Button>
        </div>
      </form>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          type="button"
          onClick={() => setParams({ category: undefined })}
          className={cn(
            "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
            !activeCategory
              ? "bg-foreground text-background border-foreground"
              : "bg-card hover:border-foreground/40"
          )}
        >
          All
        </button>
        {CATEGORIES.map((c) => {
          const active = activeCategory === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() =>
                setParams({ category: active ? undefined : c.slug })
              }
              className={cn(
                "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                active
                  ? "bg-gradient-to-r text-white border-transparent shadow-neon " +
                    c.color
                  : "bg-card hover:border-foreground/40"
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {(activeCategory || defaultQuery || (activeSort && activeSort !== "trending")) && (
        <p className="text-xs text-muted-foreground">
          Filters:
          {activeCategory ? (
            <span className="ml-1 font-medium text-foreground">
              {CATEGORIES.find((c) => c.slug === activeCategory)?.name || activeCategory}
            </span>
          ) : null}
          {defaultQuery ? (
            <span className="ml-1 font-medium text-foreground">
              · “{defaultQuery}”
            </span>
          ) : null}
          {activeSort && activeSort !== "trending" ? (
            <span className="ml-1 font-medium text-foreground">
              · {SORTS.find((s) => s.value === activeSort)?.label || activeSort}
            </span>
          ) : null}
          <button
            type="button"
            className="ml-2 underline underline-offset-2 hover:text-foreground"
            onClick={() => {
              setQ("");
              router.push("/blogs");
            }}
          >
            Clear all
          </button>
        </p>
      )}
    </div>
  );
}
