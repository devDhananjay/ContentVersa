"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { cn } from "@/lib/utils";

/** Same routes as DisableAutoAds — no sticky bar on utility flows */
const HIDDEN_PREFIXES = [
  "/tools",
  "/huid-verification",
  "/jobpilot",
  "/contact",
  "/advertise",
  "/theme-preview",
  "/dashboard",
  "/auth",
  "/login",
  "/signup",
];

/**
 * YourStory-style mobile sticky banner: fixed above `#site-mobile-nav`.
 * Desktop hidden. Dedicated 320×50 (not Google Anchor — avoids double bars).
 */
export function MobileStickyBottomAd({
  className,
  slotKey = "horizontal",
}: {
  className?: string;
  slotKey?: "sidebar" | "hub" | "horizontal" | "inArticle";
}) {
  const pathname = usePathname() || "";
  const hidden = HIDDEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const [bottom, setBottom] = React.useState(64);

  React.useEffect(() => {
    if (hidden) return;
    const measure = () => {
      const nav = document.getElementById("site-mobile-nav");
      if (!nav || window.getComputedStyle(nav).display === "none") {
        setBottom(0);
        return;
      }
      setBottom(Math.ceil(nav.getBoundingClientRect().height));
    };
    measure();
    window.addEventListener("resize", measure);
    const mo = new MutationObserver(measure);
    const nav = document.getElementById("site-mobile-nav");
    if (nav) mo.observe(nav, { attributes: true, childList: true, subtree: true });
    return () => {
      window.removeEventListener("resize", measure);
      mo.disconnect();
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <aside
      aria-label="Advertisement"
      data-cv-ad-zone="mobile-sticky-bottom"
      className={cn(
        "fixed inset-x-0 z-[39] flex justify-center border-t border-border/50 bg-background/95 pt-1 shadow-[0_-2px_8px_rgba(14,30,37,0.08)] md:hidden",
        className
      )}
      style={{ bottom }}
    >
      <div className="w-[320px] max-w-full overflow-hidden">
        <GoogleAdSense slotKey={slotKey} width={320} height={50} lazy={false} />
      </div>
    </aside>
  );
}
