"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/** Scroll window to top on every client-side route change. */
export function ScrollToTop() {
  const pathname = usePathname();

  React.useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
