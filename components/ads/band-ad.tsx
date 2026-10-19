"use client";

import * as React from "react";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { cn } from "@/lib/utils";

type Size = { w: number; h: number };

/** Pick an IAB banner size by viewport (TOI-style). */
function pickSize(): Size {
  if (typeof window === "undefined") return { w: 728, h: 90 };
  const vw = window.innerWidth;
  if (vw >= 1024) return { w: 728, h: 90 };
  if (vw >= 640) return { w: 468, h: 60 };
  return { w: 320, h: 100 };
}

/**
 * Wide banner. Fixed IAB size, frame shrink-wraps to the ad (no white side bars).
 * Always mounted — no show/hide logic.
 */
export function BandAd({
  slotKey = "horizontal",
  className,
}: {
  slotKey?: "sidebar" | "hub" | "horizontal" | "inArticle";
  className?: string;
}) {
  const [size, setSize] = React.useState<Size | null>(null);

  React.useEffect(() => {
    setSize(pickSize());
  }, []);

  // Reserve the desktop height before mount to avoid layout shift
  const reserveH = size?.h ?? 90;

  return (
    <aside
      aria-label="Advertisement"
      data-cv-ad-zone="band"
      className={cn("my-6 flex w-full flex-col items-center", className)}
    >
      <p className="mb-1.5 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        Advertisement
      </p>
      <div
        className="max-w-full"
        style={{ minHeight: reserveH, width: size?.w }}
      >
        {size ? (
          <GoogleAdSense
            slotKey={slotKey}
            width={size.w}
            height={size.h}
          />
        ) : null}
      </div>
    </aside>
  );
}
