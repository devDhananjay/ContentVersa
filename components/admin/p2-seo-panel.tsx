"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { P2ContentTopic } from "@/lib/seo/p2-content-plan";

type RefreshCandidate = {
  id: string;
  slug: string;
  title: string;
  views: number;
  readingTime: number;
  score: number;
  reasons: string[];
};

export function P2SeoPanel() {
  const [topics, setTopics] = React.useState<P2ContentTopic[]>([]);
  const [candidates, setCandidates] = React.useState<RefreshCandidate[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [planRes, refreshRes] = await Promise.all([
        fetch("/api/admin/seo/content-plan", { credentials: "include" }),
        fetch("/api/admin/seo/refresh-candidates", { credentials: "include" }),
      ]);
      const plan = (await planRes.json()) as { topics?: P2ContentTopic[] };
      const refresh = (await refreshRes.json()) as { candidates?: RefreshCandidate[] };
      if (planRes.ok) setTopics(plan.topics ?? []);
      if (refreshRes.ok) setCandidates(refresh.candidates ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const high = topics.filter((t) => t.priority === "high");

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground max-w-2xl">
          P2 pipeline: pick topics with GSC impressions, generate drafts in{" "}
          <Link href="/admin/ai-articles" className="text-primary hover:underline">
            AI articles
          </Link>
          , human-edit, then publish. Refresh weak posts before adding new URLs.
        </p>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Reload
        </Button>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-500" />
          Content plan ({topics.length} topics)
        </h2>
        <p className="text-sm text-muted-foreground">
          High priority ({high.length}): start here after checking Search Console.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {topics.slice(0, 12).map((t) => (
            <div key={t.id} className="rounded-2xl border bg-card p-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant={t.priority === "high" ? "warning" : "secondary"}>
                  {t.priority}
                </Badge>
                <Badge variant="outline">{t.clusterId}</Badge>
              </div>
              <p className="font-semibold text-sm leading-snug">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.searchIntent}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href={`/admin/ai-articles?topic=${encodeURIComponent(t.title)}`}>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Draft in AI
                  </Button>
                </Link>
                {t.relatedToolHref ? (
                  <Link href={t.relatedToolHref} target="_blank">
                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                      Tool link
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        {topics.length > 12 ? (
          <p className="text-xs text-muted-foreground">
            + {topics.length - 12} more in API /{" "}
            <code className="text-[10px]">lib/seo/p2-content-plan.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">Refresh candidates</h2>
        <p className="text-sm text-muted-foreground">
          On-site signals only — cross-check low CTR queries in GSC before editing.
        </p>
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-xl border p-6">
            {loading ? "Loading…" : "No refresh candidates right now."}
          </p>
        ) : (
          <div className="space-y-2">
            {candidates.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between rounded-xl border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.views} views · {c.readingTime} min · score {c.score} —{" "}
                    {c.reasons.join("; ")}
                  </p>
                </div>
                <Link href={`/admin/blogs/${c.id}/edit`} className="shrink-0">
                  <Button size="sm" variant="outline">
                    Edit & refresh
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
