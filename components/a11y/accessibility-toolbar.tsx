"use client";

import { AccessibilityHub } from "@/components/a11y/accessibility-hub";
import { cn } from "@/lib/utils";

/** Fixed bottom-right accessibility entry point — above mobile nav, clear of safe area. */
export function AccessibilityToolbar() {
  return (
    <div
      className={cn(
        "fixed z-[55] pointer-events-none",
        "bottom-[calc(6.5rem+env(safe-area-inset-bottom,0px))] right-4",
        "sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:right-5",
        "md:bottom-6 md:right-6"
      )}
      data-a11y-exclude
      aria-hidden={false}
    >
      <div className="pointer-events-auto">
        <AccessibilityHub />
      </div>
    </div>
  );
}
