"use client";

import * as React from "react";

/** Measures the fixed header and sets --site-header-offset so main content never sits under it. */
export function HeaderHeightSync() {
  React.useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;

    const sync = () => {
      const h = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--site-header-offset", `${h}px`);
    };

    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(header);
    window.addEventListener("resize", sync);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return null;
}
