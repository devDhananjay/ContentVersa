"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TrendingUp, Flame } from "lucide-react";

interface Trend {
  title: string;
  traffic: string;
  href: string;
  slug?: string;
}

export function TrendingStrip() {
  const [trends, setTrends] = useState<Trend[]>([]);

  useEffect(() => {
    fetch("/api/trending")
      .then((r) => r.json())
      .then((data: Trend[]) => {
        if (Array.isArray(data) && data.length) setTrends(data);
      })
      .catch(() => {});
  }, []);

  if (!trends.length) return null;

  const loop = [...trends, ...trends];

  return (
    <section
      id="trending-topics"
      className="scroll-mt-20 border-b border-border/40 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5"
    >
      <div className="container py-3 md:py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/trending"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
          >
            <Flame className="h-3.5 w-3.5" />
            Trending Now
          </Link>

          <div className="relative min-w-0 flex-1 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-background to-transparent" />

            <div className="flex w-max items-center gap-4 animate-marquee-trending hover:[animation-play-state:paused]">
              {loop.map((t, i) => (
                <Link
                  key={`${t.href}-${i}`}
                  href={t.href || `/trending/${t.slug || ""}`}
                  prefetch
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/50 bg-card/80 px-3 py-1.5 text-xs font-semibold transition hover:border-orange-400/50 hover:bg-orange-500/10 hover:text-orange-300"
                >
                  <TrendingUp className="h-3 w-3 text-orange-400" />
                  <span className="max-w-[200px] truncate">{t.title}</span>
                  {t.traffic ? (
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {t.traffic}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
