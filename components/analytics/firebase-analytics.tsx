"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getFirebaseAnalytics } from "@/lib/firebase";

/**
 * Initializes Firebase / GA4 Analytics once, then logs `page_view`
 * on App Router navigations (SPA-style route changes).
 */
export function FirebaseAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ready = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const analytics = await getFirebaseAnalytics();
      if (!cancelled && analytics) ready.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!pathname) return;
    void (async () => {
      const analytics = await getFirebaseAnalytics();
      if (!analytics) return;
      const { logEvent } = await import("firebase/analytics");
      const query = searchParams?.toString();
      const pagePath = query ? `${pathname}?${query}` : pathname;
      logEvent(analytics, "page_view", {
        page_path: pagePath,
        page_location:
          typeof window !== "undefined" ? window.location.href : pagePath,
        page_title: typeof document !== "undefined" ? document.title : undefined,
      });
    })();
  }, [pathname, searchParams]);

  return null;
}
