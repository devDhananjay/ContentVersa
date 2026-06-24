import Link from "next/link";
import { Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SarkariListing } from "@/lib/jobs/types";
import { cn } from "@/lib/utils";

function isClosingSoon(lastDate: string | null | undefined) {
  if (!lastDate) return false;
  const parsed = Date.parse(lastDate);
  if (Number.isNaN(parsed)) return /today|last date/i.test(lastDate);
  const days = (parsed - Date.now()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 7;
}

export function GovtJobCard({
  item,
  showDate = false,
  className,
}: {
  item: SarkariListing;
  showDate?: boolean;
  className?: string;
}) {
  const closingSoon = showDate && isClosingSoon(item.last_date);

  return (
    <article
      className={cn(
        "group rounded-2xl border border-border/60 bg-card/50 p-4 md:p-5",
        "hover:border-amber-500/40 hover:bg-amber-500/5 transition-colors",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400"
            >
              Sarkari
            </Badge>
            {closingSoon && (
              <Badge variant="destructive" className="text-[10px]">
                Closing soon
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm md:text-base leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {item.title}
          </h3>
          {showDate && item.last_date ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Last date: <span className="font-medium text-foreground">{item.last_date}</span>
            </p>
          ) : null}
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0 gap-1.5">
          <Link href={item.link} target="_blank" rel="noopener noreferrer">
            View
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
