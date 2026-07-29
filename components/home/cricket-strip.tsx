"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tv, Circle } from "lucide-react";

interface StripMatch {
  id: string;
  title: string;
  status: string;
  team1: { name: string; score?: string };
  team2: { name: string; score?: string };
  isLive: boolean;
  href: string;
}

export function CricketStrip() {
  const [matches, setMatches] = useState<StripMatch[]>([]);

  useEffect(() => {
    fetch("/api/cricket/live-strip")
      .then((r) => r.json())
      .then((data: StripMatch[]) => {
        if (Array.isArray(data) && data.length) setMatches(data);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      fetch("/api/cricket/live-strip")
        .then((r) => r.json())
        .then((data: StripMatch[]) => {
          if (Array.isArray(data) && data.length) setMatches(data);
        })
        .catch(() => {});
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  if (!matches.length) return null;

  const loop = [...matches, ...matches];

  return (
    <section
      id="cricket-strip"
      className="scroll-mt-20 border-b border-border/40 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5"
    >
      <div className="container py-3 md:py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/sports"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
          >
            <Tv className="h-3.5 w-3.5" />
            Cricket
          </Link>

          <div className="relative min-w-0 flex-1 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-background to-transparent" />

            <div className="flex w-max items-center gap-3 animate-marquee-cricket hover:[animation-play-state:paused]">
              {loop.map((m, i) => (
                <Link
                  key={`${m.id}-${i}`}
                  href={m.href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border/50 bg-card/80 px-3 py-2 text-xs transition hover:border-emerald-400/50 hover:bg-emerald-500/10"
                >
                  {m.isLive && (
                    <Circle className="h-2 w-2 fill-red-500 text-red-500 animate-pulse" />
                  )}
                  <span className="font-bold">{m.team1.name}</span>
                  {m.team1.score && (
                    <span className="text-muted-foreground">{m.team1.score}</span>
                  )}
                  <span className="text-muted-foreground/60">vs</span>
                  <span className="font-bold">{m.team2.name}</span>
                  {m.team2.score && (
                    <span className="text-muted-foreground">{m.team2.score}</span>
                  )}
                  <span className="max-w-[160px] truncate text-[10px] text-muted-foreground">
                    {m.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
