"use client";

import * as React from "react";

/**
 * Official AdSense Anchor defaults to a full-width / bottom bar.
 * Site FABs (help, a11y) sit bottom-right — nudge Anchor to bottom-left
 * so they don’t collide. Never hide the ad (policy); only reposition.
 */
export function AdSenseAnchorAlign() {
  React.useEffect(() => {
    const BOTTOM_MAX = 120;
    const RIGHT_CLEAR = 96; // leave dock clear

    const isAnchorCandidate = (el: HTMLElement) => {
      const st = window.getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") return false;
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.height < 40) return false;
      if (r.height > window.innerHeight * 0.55) return false; // not vignette fullscreen
      const nearBottom = window.innerHeight - r.bottom <= BOTTOM_MAX;
      if (!nearBottom) return false;
      // Prefer Google-injected nodes
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
      return looksGoogle || (r.width >= window.innerWidth * 0.7 && nearBottom);
    };

    const align = (el: HTMLElement) => {
      if (el.dataset.cvAnchorAligned === "1") return;
      const r = el.getBoundingClientRect();
      const maxW = Math.min(360, Math.max(280, window.innerWidth - RIGHT_CLEAR - 24));
      el.style.setProperty("left", "12px", "important");
      el.style.setProperty("right", "auto", "important");
      el.style.setProperty("margin-left", "0", "important");
      el.style.setProperty("margin-right", "0", "important");
      el.style.setProperty("transform", "none", "important");
      if (r.width > maxW || r.width >= window.innerWidth * 0.85) {
        el.style.setProperty("width", `${maxW}px`, "important");
        el.style.setProperty("max-width", `${maxW}px`, "important");
      }
      el.style.setProperty("bottom", "12px", "important");
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
      // Also catch fixed bottom bars Google injects without class names
      document.querySelectorAll<HTMLElement>("body > div, body > ins").forEach((el) => {
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
