"use client";

import { Button } from "react-aria-components";
import { cn } from "@/lib/utils";

export function A11yActionButton({
  onPress,
  icon,
  title,
  description,
  disabled,
  highlight,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <Button
      onPress={onPress}
      isDisabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left min-h-[3.25rem]",
        "outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-50 disabled:pointer-events-none",
        highlight
          ? "border-primary/50 bg-primary/10 hover:bg-primary/15"
          : "border-border/60 hover:bg-muted/50"
      )}
    >
      <span className="shrink-0 text-primary" aria-hidden="true">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold leading-tight">{title}</span>
        <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">{description}</span>
      </span>
    </Button>
  );
}
