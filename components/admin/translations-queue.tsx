"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Row = {
  id: string;
  status: string;
  source: string;
  title: string;
  updatedAt: string;
  blog: {
    id: string;
    slug: string;
    title: string;
    status: string;
    category: { slug: string; name: string } | null;
  };
};

export function TranslationsQueue() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/translations");
      const data = (await res.json()) as { data?: Row[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      setRows(data.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const patch = async (blogId: string, status: "PUBLISHED" | "DRAFT" | "READY") => {
    setBusy(blogId);
    try {
      const res = await fetch("/api/admin/translations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId, status }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading queue…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground rounded-2xl border bg-card p-6">
          No pending Hindi drafts. Generate from the blog editor or run the backfill
          script.
        </p>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <ul className="divide-y">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium truncate">{r.title}</p>
                    <Badge variant="secondary">{r.status}</Badge>
                    <Badge variant="outline">{r.source}</Badge>
                    {r.blog.category ? (
                      <Badge variant="outline">{r.blog.category.name}</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    EN: {r.blog.title} ·{" "}
                    <Link
                      href={`/blog/${r.blog.slug}`}
                      className="underline underline-offset-2"
                    >
                      /blog/{r.blog.slug}
                    </Link>{" "}
                    ·{" "}
                    <Link
                      href={`/hi/blog/${r.blog.slug}`}
                      className="underline underline-offset-2"
                    >
                      /hi/blog/{r.blog.slug}
                    </Link>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="gradient"
                    disabled={busy === r.blog.id}
                    onClick={() => patch(r.blog.id, "PUBLISHED")}
                  >
                    {busy === r.blog.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Approve Hindi
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === r.blog.id}
                    onClick={() => patch(r.blog.id, "DRAFT")}
                  >
                    Keep draft
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={load}>
        Refresh
      </Button>
    </div>
  );
}
