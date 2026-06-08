import type { IndexQuote } from "@/lib/finance/types";
import { ChangeBadge } from "./change-badge";
import { cn } from "@/lib/utils";

interface IndexCardProps {
  index: IndexQuote;
  compact?: boolean;
  className?: string;
}

export function IndexCard({ index, compact, className }: IndexCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-card/60",
        compact ? "px-2.5 py-2" : "p-3",
        className
      )}
    >
      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
        {index.name}
      </p>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span
          className={cn(
            "font-display font-bold tabular-nums",
            compact ? "text-sm" : "text-lg"
          )}
        >
          {index.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </span>
        <ChangeBadge
          change={index.change}
          changePercent={index.changePercent}
          size="xs"
        />
      </div>
    </div>
  );
}
