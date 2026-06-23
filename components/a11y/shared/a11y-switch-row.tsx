"use client";

import type { ReactNode } from "react";
import { Switch } from "react-aria-components";
import { cn } from "@/lib/utils";

type A11ySwitchRowProps = {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  isSelected: boolean;
  onChange: (value: boolean) => void;
};

export function A11ySwitchRow({
  id,
  label,
  description,
  icon,
  isSelected,
  onChange,
}: A11ySwitchRowProps) {
  return (
    <Switch
      id={id}
      isSelected={isSelected}
      onChange={onChange}
      className={cn(
        "group flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5",
        "cursor-pointer outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "data-[selected]:border-primary/40 data-[selected]:bg-primary/5"
      )}
    >
      {({ isSelected: selected }) => (
        <>
          <span className="flex items-start gap-2.5 min-w-0 text-left">
            <span className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true">
              {icon}
            </span>
            <span>
              <span className="block text-sm font-medium leading-tight">{label}</span>
              <span className="block text-xs text-muted-foreground mt-0.5">{description}</span>
            </span>
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
              selected ? "bg-primary" : "bg-input"
            )}
          >
            <span
              className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                selected ? "translate-x-5" : "translate-x-0"
              )}
            />
          </span>
        </>
      )}
    </Switch>
  );
}
