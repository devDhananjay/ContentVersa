"use client";

import type { ReactNode } from "react";
import { Dialog, Heading } from "react-aria-components";
import { cn } from "@/lib/utils";

type A11yPanelProps = {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
};

export function A11yPanel({
  title,
  description,
  icon,
  children,
  className,
}: A11yPanelProps) {
  return (
    <Dialog
      className={cn(
        "w-[min(100vw-2.5rem,22rem)] rounded-2xl border border-border/60",
        "bg-background shadow-2xl overflow-hidden outline-none",
        "entering:animate-in entering:fade-in-0 entering:slide-in-from-bottom-4 entering:duration-200",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0 px-5 py-4 border-b border-border/60">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0 text-left">
          <Heading slot="title" className="text-base font-semibold leading-tight">
            {title}
          </Heading>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </Dialog>
  );
}
