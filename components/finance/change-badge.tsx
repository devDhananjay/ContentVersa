import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface ChangeBadgeProps {
  change: number;
  changePercent: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function ChangeBadge({
  change,
  changePercent,
  size = "sm",
  className,
}: ChangeBadgeProps) {
  const up = changePercent >= 0;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium tabular-nums",
        up ? "text-emerald-500" : "text-red-500",
        size === "xs" && "text-[9px]",
        size === "sm" && "text-[10px]",
        size === "md" && "text-xs",
        className
      )}
    >
      <Icon
        className={cn(
          size === "xs" && "h-2 w-2",
          size === "sm" && "h-2.5 w-2.5",
          size === "md" && "h-3 w-3"
        )}
      />
      {up ? "+" : ""}
      {changePercent.toFixed(2)}%
    </span>
  );
}
