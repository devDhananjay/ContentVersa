"use client";

import { Button } from "react-aria-components";
import { cn } from "@/lib/utils";

export function A11yPresetChip({
  label,
  hint,
  onPress,
  active,
}: {
  label: string;
  hint?: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Button
      onPress={onPress}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap",
        "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border/70 bg-muted/40 hover:bg-muted/70 text-foreground"
      )}
    >
      <span>{label}</span>
      {hint && <span className="sr-only">. {hint}</span>}
    </Button>
  );
}
