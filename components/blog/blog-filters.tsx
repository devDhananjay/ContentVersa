"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

  const setParam = React.useCallback(
    (key: string, value?: string) => {
      const next = new URLSearchParams(sp?.toString() || "");
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/blogs?${next.toString()}`);
    },
    [router, sp]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("q", q || undefined);
  };

  const activeCategory = defaultCategory;

  return (
    <div className="sticky top-16 z-20 -mx-4 px-4 py-4 mb-4 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles, creators, tags…"
            className="pl-9 h-11"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setParam("q", undefined);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select
          defaultValue={defaultSort}
          onValueChange={(v) => setParam("sort", v)}
        >
          <SelectTrigger className="w-full md:w-44 h-11">
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
        <Button type="submit" variant="gradient" className="gap-2 h-11">
          <Sparkles className="h-4 w-4" /> Apply
        </Button>
      </form>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        <button
          type="button"
          onClick={() => setParam("category", undefined)}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
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
              onClick={() => setParam("category", active ? undefined : c.slug)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                active
                  ? "bg-gradient-to-r text-white border-transparent shadow-neon " + c.color
                  : "bg-card hover:border-foreground/40"
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
