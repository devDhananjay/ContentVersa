"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { CricketSeries } from "@/lib/sports/types";
import { Badge } from "@/components/ui/badge";
import { SportsSectionHeader } from "@/components/sports/sports-section-header";

interface SeriesCarouselProps {
  series: CricketSeries[];
}

export function SeriesCarousel({ series }: SeriesCarouselProps) {
  if (!series.length) return null;

  return (
    <section>
      <SportsSectionHeader
        eyebrow="Tournaments"
        title="Active"
        highlight="Series"
      />

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        {series.map((s) => (
          <Link
            key={s.id}
            href={`/sports/series/${s.id}`}
            className="snap-start shrink-0 w-[240px] rounded-xl border bg-card p-4 hover:border-neon-purple/40 hover:shadow-sm transition-colors block"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <CalendarDays className="h-5 w-5 text-neon-purple shrink-0" />
              {s.monthLabel && (
                <Badge variant="outline" className="text-[10px]">
                  {s.monthLabel}
                </Badge>
              )}
            </div>
            <h3 className="font-display font-bold leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-neon-cyan">
              {s.name}
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(s.startDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
              {" – "}
              {new Date(s.endDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <span className="mt-3 inline-block text-xs font-medium text-neon-cyan">
              View series →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
