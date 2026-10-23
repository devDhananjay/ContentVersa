"use client";

import * as React from "react";

/**
 * Lift AdSense bottom Anchor above the mobile tab bar (YourStory-style sticky).
 * Desktop: keep a normal bottom bar. Never hide the ad — only reposition.
 */
export function AdSenseAnchorAlign() {
  React.useEffect(() => {
    const BOTTOM_SCAN = 160;

    const mobileNavHeight = () => {
      const nav = document.getElementById("site-mobile-nav");
      if (!nav || window.getComputedStyle(nav).display === "none") return 0;
      return Math.ceil(nav.getBoundingClientRect().height);
    };

    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

    const isAnchorCandidate = (el: HTMLElement) => {
      const st = window.getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") return false;
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.height < 40) return false;
      if (r.height > window.innerHeight * 0.55) return false; // not vignette
      const nearBottom = window.innerHeight - r.bottom <= BOTTOM_SCAN;
      if (!nearBottom) return false;
      const id = el.id || "";
      const cls = typeof el.className === "string" ? el.className : "";
      const src =
        el instanceof HTMLIFrameElement
          ? el.src || el.getAttribute("name") || ""
          : "";
      const looksGoogle =
        /adsbygoogle|google_ads|aswift|google-auto-placed|anchor/i.test(
          id + cls + src
        ) ||
        !!el.closest("ins.adsbygoogle") ||
        !!el.closest(".google-auto-placed");
      return looksGoogle || (r.width >= window.innerWidth * 0.65 && nearBottom);
    };

    const align = (el: HTMLElement) => {
      const navH = isMobile() ? mobileNavHeight() : 0;
      // Full-width sticky strip above MobileNav (YS pattern)
      el.style.setProperty("left", "0", "important");
      el.style.setProperty("right", "0", "important");
      el.style.setProperty("margin-left", "0", "important");
      el.style.setProperty("margin-right", "0", "important");
      el.style.setProperty("transform", "none", "important");
      el.style.setProperty("width", "100%", "important");
      el.style.setProperty("max-width", "100%", "important");
      el.style.setProperty(
        "bottom",
        navH > 0 ? `${navH}px` : "0px",
        "important"
      );
      el.style.setProperty("z-index", "39", "important"); // under MobileNav (z-40)
      el.dataset.cvAnchorAligned = "1";
    };

    const scan = () => {
      const nodes = document.querySelectorAll<HTMLElement>(
        "ins.adsbygoogle, .google-auto-placed, iframe[id*='google_ads'], iframe[name*='google_ads'], div[id*='aswift']"
      );
      nodes.forEach((el) => {
        if (isAnchorCandidate(el)) align(el);
        const parent = el.parentElement;
        if (parent && isAnchorCandidate(parent)) align(parent);
      });
      document
        .querySelectorAll<HTMLElement>("body > div, body > ins")
        .forEach((el) => {
          if (isAnchorCandidate(el)) align(el);
        });
    };

    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    const onResize = () => {
      document
        .querySelectorAll<HTMLElement>("[data-cv-anchor-aligned='1']")
        .forEach((el) => {
          el.dataset.cvAnchorAligned = "0";
        });
      scan();
    };
    window.addEventListener("resize", onResize);
    const tick = window.setInterval(scan, 2000);
    return () => {
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      window.clearInterval(tick);
    };
  }, []);

  return null;
}
