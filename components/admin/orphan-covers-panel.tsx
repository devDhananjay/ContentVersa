"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

export function OrphanCoversPanel() {
  const [rows, setRows] = React.useState<OrphanRow[]>([]);
  const [stats, setStats] = React.useState<{ totalOrphans: number; usedCount: number; diskCount: number } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [assigning, setAssigning] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orphan-covers?limit=100");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setRows(data.rows ?? []);
      setStats({
        totalOrphans: data.totalOrphans,
        usedCount: data.usedCount,
        diskCount: data.diskCount,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load orphan covers");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

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
      if (stats) setStats({ ...stats, totalOrphans: stats.totalOrphans - 1, usedCount: stats.usedCount + 1 });
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

  return (
    <div className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3">
        <ImageIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">Restore orphan cover images</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.totalOrphans ?? 0} uploaded files on disk are not linked to any blog.
            Your images are safe on the server — click Link to attach them.
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Disk: {stats?.diskCount ?? 0} · Linked: {stats?.usedCount ?? 0}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orphan files in this batch — refresh or all are linked.</p>
      ) : (
        <div className="grid gap-3 max-h-[min(70vh,520px)] overflow-y-auto pr-1">
          {rows.map((row) => (
            <div
              key={row.file}
              className="flex flex-col sm:flex-row gap-3 rounded-lg border bg-background/80 p-3"
            >
              <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={row.url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized={shouldSkipImageOptimization(row.url)}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <code className="text-[11px] text-muted-foreground break-all">{row.file}</code>
                {row.suggestions.length ? (
                  <div className="space-y-1.5">
                    {row.suggestions.map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-wrap items-center gap-2 text-xs"
                      >
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
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No auto-match — open{" "}
                    <a href="/admin/blogs" className="underline">
                      All blogs
                    </a>{" "}
                    and set cover manually using filename above.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
        Refresh list
      </Button>
    </div>
  );
}
