"use client";

import { HelpChatWidget } from "@/components/help/help-chat-widget";
import { cn } from "@/lib/utils";

/** Bottom-right dock — help chat + accessibility buttons together */
export function FloatingActionDock() {
  return (
    <div
      className={cn(
        "fixed z-[60] pointer-events-none flex flex-col items-end",
        "bottom-[calc(6.5rem+env(safe-area-inset-bottom,0px))] right-4",
        "sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:right-5",
        "md:bottom-6 md:right-6"
      )}
      data-a11y-exclude
    >
      <HelpChatWidget />
    </div>
  );
}
