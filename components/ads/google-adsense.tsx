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
  multiplex: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MULTIPLEX?.trim(),
};

type Format = "auto" | "rectangle" | "horizontal" | "vertical" | "autorelaxed";

type Props = {
  slot?: string;
  slotKey?: keyof typeof DEFAULT_SLOTS;
  format?: Format;
  className?: string;
  lazy?: boolean;
  /**
   * Fixed IAB size (TOI-style). When both are set the ins is exactly
   * width x height with no responsive attributes, so the frame equals the ad.
   */
  width?: number;
  height?: number;
};

const MIN_HEIGHT: Record<Format, string> = {
  auto: "min-h-[90px]",
  rectangle: "min-h-0 h-[250px]",
  horizontal: "min-h-[90px]",
  vertical: "min-h-[480px]",
  autorelaxed: "min-h-[250px]",
};

/**
 * Standard AdSense unit — always mounted & viewable.
 * No show/hide on fill status (that was blocking inventory).
 */
export function GoogleAdSense({
  slot,
  slotKey,
  format = "auto",
  className,
  lazy = true,
  width,
  height,
}: Props) {
  if (!ADSENSE_ID) return null;

  const resolvedSlot =
    slot || (slotKey ? DEFAULT_SLOTS[slotKey] : undefined) || undefined;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const pushedRef = React.useRef(false);
  const [active, setActive] = React.useState(!lazy);

  React.useEffect(() => {
    if (!lazy) return;
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy]);

  React.useEffect(() => {
    if (!active || pushedRef.current) return;
    if (typeof window === "undefined") return;
    pushedRef.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      /* ad blockers */
    }
  }, [active]);

  const isFixed = typeof width === "number" && typeof height === "number";

  if (isFixed) {
    return (
      <div
        ref={rootRef}
        data-cv-ad-zone="editorial"
        data-cv-ad-size={`${width}x${height}`}
        className={cn("mx-auto max-w-full overflow-hidden bg-transparent", className)}
        style={{ width, height, minHeight: height }}
      >
        {active ? (
          <ins
            className="adsbygoogle"
            style={{
              display: "inline-block",
              width,
              height,
              background: "transparent",
            }}
            data-ad-client={ADSENSE_ID}
            data-ad-slot={resolvedSlot}
          />
        ) : null}
      </div>
    );
  }

  const fullWidth = format === "auto" || format === "horizontal";
  const isVertical = format === "vertical";
  const isRectangle = format === "rectangle";

  return (
    <div
      ref={rootRef}
      data-cv-ad-zone="editorial"
      className={cn(
        "overflow-hidden bg-transparent [&_.adsbygoogle]:bg-transparent",
        isRectangle ? "mx-auto rounded-lg" : "rounded-xl",
        isVertical ? "flex h-full min-h-[480px] flex-col" : MIN_HEIGHT[format],
        className
      )}
    >
      {active ? (
        <ins
          className={cn(
            "adsbygoogle bg-transparent",
            isVertical
              ? "block h-full w-full min-h-[480px] flex-1"
              : isRectangle
                ? "inline-block"
                : cn("block", MIN_HEIGHT[format])
          )}
          style={
            isVertical
              ? {
                  display: "block",
                  width: "100%",
                  height: "100%",
                  minHeight: 480,
                  background: "transparent",
                }
              : isRectangle
                ? {
                    display: "inline-block",
                    width: 300,
                    height: 250,
                    background: "transparent",
                  }
                : { display: "block", width: "100%", background: "transparent" }
          }
          data-ad-client={ADSENSE_ID}
          data-ad-slot={resolvedSlot}
          data-ad-format={
            isVertical ? "vertical" : isRectangle ? "rectangle" : format
          }
          {...(format === "autorelaxed"
            ? {}
            : { "data-full-width-responsive": fullWidth ? "true" : "false" })}
        />
      ) : (
        <div
          className={cn(
            "rounded-lg bg-transparent",
            isVertical
              ? "h-full min-h-[480px] w-full flex-1"
              : isRectangle
                ? "h-[250px] w-[300px] max-w-full"
                : cn("w-full", MIN_HEIGHT[format])
          )}
          aria-hidden
        />
      )}
    </div>
  );
}
