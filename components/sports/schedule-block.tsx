import Link from "next/link";
import type { ScheduleDay } from "@/lib/sports/types";
import { Badge } from "@/components/ui/badge";
import { SportsSectionHeader } from "@/components/sports/sports-section-header";
import { MapPin } from "lucide-react";

interface ScheduleBlockProps {
  schedule: ScheduleDay[];
}

export function ScheduleBlock({ schedule }: ScheduleBlockProps) {
  if (!schedule.length) return null;

  const items = schedule.flatMap((day) =>
    day.matches.map((match) => ({ ...match, dateLabel: day.dateLabel }))
  );

  return (
    <section>
      <SportsSectionHeader eyebrow="Calendar" title="Match" highlight="Schedule" />

      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        {items.slice(0, 16).map((match) => (
          <Link
            key={match.id}
            href={`/sports/match/${match.id}`}
            className="snap-start shrink-0 w-[220px] rounded-xl border bg-card p-3 hover:border-neon-cyan/40 hover:shadow-sm transition-colors block cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-medium text-muted-foreground truncate">
                {match.dateLabel}
              </span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">
                {match.format}
              </Badge>
            </div>
            <p className="text-sm font-bold leading-tight">
              {match.team1.shortName}{" "}
              <span className="text-muted-foreground font-normal text-xs">vs</span>{" "}
              {match.team2.shortName}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
              {match.matchDesc}
            </p>
            {match.venue && (
              <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{match.venue.city}</span>
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
