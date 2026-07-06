"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const ADSENSE_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID?.trim();

type Props = {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
};

export function GoogleAdSense({
  slot,
  format = "auto",
  className,
}: Props) {
  if (!ADSENSE_ID) return null;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      /* ad blockers */
    }
  }, []);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl bg-muted/10 dark:bg-muted/20 [&_.adsbygoogle]:bg-transparent",
        className
      )}
    >
      <ins
        className="adsbygoogle block min-h-0 bg-transparent"
        style={{ display: "block", background: "transparent" }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={slot || undefined}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
