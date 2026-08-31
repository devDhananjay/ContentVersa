"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Link2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shouldSkipImageOptimization } from "@/lib/upload";

type Suggestion = {
  id: string;
  slug: string;
  title: string;
  status: string;
  score: number;
};

type OrphanRow = {
  file: string;
  url: string;
  suggestions: Suggestion[];
};

type BlogMatch = {
  id: string;
  slug: string;
  title: string;
  status: string;
};

export function OrphanCoversPanel() {
  const [rows, setRows] = React.useState<OrphanRow[]>([]);
  const [stats, setStats] = React.useState<{
    totalOrphans: number;
    usedCount: number;
    diskCount: number;
    offset: number;
    hasMore: boolean;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [assigning, setAssigning] = React.useState<string | null>(null);
  const [searchByFile, setSearchByFile] = React.useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = React.useState<Record<string, BlogMatch[]>>({});
  const [searching, setSearching] = React.useState<string | null>(null);

  const load = React.useCallback(async (append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const offset = append ? rows.length : 0;
      const res = await fetch(`/api/admin/orphan-covers?limit=200&offset=${offset}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setRows((prev) => (append ? [...prev, ...(data.rows ?? [])] : (data.rows ?? [])));
      setStats({
        totalOrphans: data.totalOrphans,
        usedCount: data.usedCount,
        diskCount: data.diskCount,
        offset: data.offset ?? 0,
        hasMore: !!data.hasMore,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load orphan covers");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [rows.length]);

  React.useEffect(() => {
    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchBlogs = async (file: string, query: string) => {
    setSearchByFile((prev) => ({ ...prev, [file]: query }));
    if (query.trim().length < 2) {
      setSearchResults((prev) => ({ ...prev, [file]: [] }));
      return;
    }
    setSearching(file);
    try {
      const res = await fetch(
        `/api/admin/orphan-covers?blogSearch=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setSearchResults((prev) => ({ ...prev, [file]: data.blogs ?? [] }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Search failed");
    } finally {
      setSearching(null);
    }
  };

  const assign = async (filename: string, blogId: string, slug: string) => {
    setAssigning(`${filename}:${blogId}`);
    try {
      const res = await fetch("/api/admin/orphan-covers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, blogId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(`Cover linked to ${slug}`);
      setRows((prev) => prev.filter((r) => r.file !== filename));
      if (stats) {
        setStats({
          ...stats,
          totalOrphans: stats.totalOrphans - 1,
          usedCount: stats.usedCount + 1,
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Assign failed");
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading orphan uploads…
      </div>
    );
  }

  const remaining = stats?.totalOrphans ?? 0;

  return (
    <div className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-8">
      <div className="flex items-start gap-3">
        <ImageIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">Restore orphan cover images</p>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>{remaining}</strong> uploaded files on disk are not linked to any blog.
            Images are safe on the server — use Link or search a blog slug/title below.
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Disk: {stats?.diskCount ?? 0} · Linked in DB: {stats?.usedCount ?? 0}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {remaining === 0
            ? "All upload files are linked to blogs."
            : "No orphan files in this batch — click Refresh."}
        </p>
      ) : (
        <div className="grid gap-3 max-h-[min(75vh,640px)] overflow-y-auto pr-1">
          {rows.map((row) => (
            <div
              key={row.file}
              className="flex flex-col sm:flex-row gap-3 rounded-lg border bg-background/80 p-3"
            >
              <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={row.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized={shouldSkipImageOptimization(row.url)}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <code className="text-[11px] text-muted-foreground break-all block">{row.file}</code>

                {row.suggestions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Suggested matches
                    </p>
                    {row.suggestions.map((s) => (
                      <div key={s.id} className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="truncate max-w-[min(100%,280px)]" title={s.title}>
                          {s.title}
                        </span>
                        <span className="text-muted-foreground">({s.score})</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          disabled={assigning === `${row.file}:${s.id}`}
                          onClick={() => void assign(row.file, s.id, s.slug)}
                        >
                          {assigning === `${row.file}:${s.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Link2 className="h-3 w-3" />
                          )}
                          Link
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Or search blog
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        className="h-8 pl-8 text-xs"
                        placeholder="Slug or title…"
                        value={searchByFile[row.file] ?? ""}
                        onChange={(e) => void searchBlogs(row.file, e.target.value)}
                      />
                    </div>
                    {searching === row.file && (
                      <Loader2 className="h-4 w-4 animate-spin self-center text-muted-foreground" />
                    )}
                  </div>
                  {(searchResults[row.file] ?? []).map((b) => (
                    <div key={b.id} className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-[11px]">{b.slug}</span>
                      <span className="truncate text-muted-foreground max-w-[200px]" title={b.title}>
                        {b.title}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs gap-1"
                        disabled={assigning === `${row.file}:${b.id}`}
                        onClick={() => void assign(row.file, b.id, b.slug)}
                      >
                        {assigning === `${row.file}:${b.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Link2 className="h-3 w-3" />
                        )}
                        Link
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void load(false)}>
          Refresh list
        </Button>
        {stats?.hasMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loadingMore}
            onClick={() => void load(true)}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" /> Loading…
              </>
            ) : (
              `Load more (${rows.length} / ${remaining} shown)`
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
