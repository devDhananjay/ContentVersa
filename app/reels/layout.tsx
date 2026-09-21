"use client";

import * as React from "react";

/** Reels viewer: lock page scroll, hide footer, fill area below fixed header only. */
export default function ReelsLayout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const footer = document.querySelector("footer");
    const main = document.querySelector("main");
    const prev = {
      bodyOverflow: document.body.style.overflow,
      mainOverflow: main?.style.overflow ?? "",
      mainPb: main?.style.paddingBottom ?? "",
      footerDisplay: footer?.style.display ?? "",
    };

    document.body.style.overflow = "hidden";
    if (main) {
      main.style.overflow = "hidden";
      main.style.paddingBottom = "0";
    }
    if (footer) footer.style.display = "none";

    return () => {
      // Always clear locks — empty string restores stylesheet control even if
      // prev was also "hidden" from a stale navigation.
      document.body.style.overflow = "";
      if (main) {
        main.style.overflow = "";
        main.style.paddingBottom = prev.mainPb;
      }
      if (footer) footer.style.display = prev.footerDisplay;
    };
  }, []);

  return (
    <div className="h-[calc(100dvh-var(--site-header-offset))] min-h-[320px] w-full overflow-hidden bg-gradient-to-b from-background via-neon-purple/10 to-neon-pink/10 flex flex-col">
      {children}
    </div>
  );
}
