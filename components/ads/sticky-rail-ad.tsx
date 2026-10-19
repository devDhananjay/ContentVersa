"use client";

import * as React from "react";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { cn } from "@/lib/utils";

type SlotKey = "sidebar" | "hub" | "horizontal" | "inArticle";

/**
 * Desktop side rail, fixed IAB size: 160x600 skyscraper, or 300x600 half page
 * on 2xl screens when `halfPage` is set (TOI right-rail style).
 * Prefer only one sticky={true} rail per viewport.
 */
export function StickyRailAd({
  slotKey = "sidebar",
  className,
  label,
  sticky = true,
  halfPage = false,
}: {
  slotKey?: SlotKey;
  className?: string;
  label?: string;
  sticky?: boolean;
  halfPage?: boolean;
}) {
  const [width, setWidth] = React.useState(160);

  React.useEffect(() => {
    setWidth(halfPage && window.innerWidth >= 1536 ? 300 : 160);
  }, [halfPage]);

  return (
    <aside
      aria-label={label ?? "Advertisement"}
      data-cv-ad-zone="rail"
      className={cn(
        "hidden xl:flex shrink-0 flex-col items-center",
        sticky &&
          "sticky top-[calc(var(--site-header-offset)+1rem)] self-start",
        className
      )}
      style={{ width }}
    >
      <p className="mb-1.5 shrink-0 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
        Ad
      </p>
      <GoogleAdSense slotKey={slotKey} width={width} height={600} />
    </aside>
  );
}
