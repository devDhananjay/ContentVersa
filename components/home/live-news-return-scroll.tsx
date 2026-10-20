"use client";

import { useEffect } from "react";

const KEY = "cv-return-live-news";

/** After browser back from a Live News briefing, restore home scroll to the section. */
export function LiveNewsReturnScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY) !== "1") return;
    sessionStorage.removeItem(KEY);
    const run = () => {
      document
        .getElementById("home-live-news")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    // Wait a tick for home layout/reels to settle
    const t = window.setTimeout(run, 80);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}

export function markReturnToLiveNews() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
}
