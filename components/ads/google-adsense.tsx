"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { normalizeAdSenseClientId } from "@/lib/adsense";

const ADSENSE_ID = normalizeAdSenseClientId(
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
);

const DEFAULT_SLOTS = {
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR?.trim(),
  inArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE?.trim(),
  horizontal: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HORIZONTAL?.trim(),
  hub: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HUB?.trim(),
};

type Format = "auto" | "rectangle" | "horizontal";

type Props = {
  slot?: string;
  /** Prefer named inventory when console slot IDs are configured. */
  slotKey?: keyof typeof DEFAULT_SLOTS;
  format?: Format;
  className?: string;
};

const MIN_HEIGHT: Record<Format, string> = {
  auto: "min-h-[120px]",
  rectangle: "min-h-[250px]",
  horizontal: "min-h-[90px]",
};

export function GoogleAdSense({
  slot,
  slotKey,
  format = "auto",
  className,
}: Props) {
  if (!ADSENSE_ID) return null;

  const resolvedSlot =
    slot || (slotKey ? DEFAULT_SLOTS[slotKey] : undefined) || undefined;

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
        MIN_HEIGHT[format],
        className
      )}
    >
      <ins
        className={cn("adsbygoogle block bg-transparent", MIN_HEIGHT[format])}
        style={{ display: "block", background: "transparent" }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={resolvedSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
