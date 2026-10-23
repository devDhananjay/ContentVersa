"use client";

import * as React from "react";

/**
 * Bottom Anchor / sticky overlay is disabled in PageLevelAds, but AdSense
 * account Auto Ads can still inject a fixed bottom bar for a while.
 * Strip those bars so mobile matches “overlays.bottom = false”.
 *
 * Does NOT touch in-article / rail / vignette units — only fixed bottom strips.
 */
export function AdSenseAnchorSuppress() {
  React.useEffect(() => {
    const kill = (el: HTMLElement) => {
      if (el.dataset.cvAnchorKilled === "1") return;
      // Never touch site chrome or our editorial ad slots
      if (el.closest("#site-mobile-nav, [data-cv-ad-zone]")) return;
      if (el.id === "site-mobile-nav" || el.id === "site-content") return;
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("pointer-events", "none", "important");
      el.style.setProperty("height", "0", "important");
      el.style.setProperty("max-height", "0", "important");
      el.style.setProperty("opacity", "0", "important");
      el.setAttribute("aria-hidden", "true");
      el.dataset.cvAnchorKilled = "1";
    };

    const isBottomAnchor = (el: HTMLElement) => {
      const st = window.getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") return false;
      if (st.display === "none") return false;
      const r = el.getBoundingClientRect();
      if (r.width < 160 || r.height < 36) return false;
      // Tall overlays = vignette modal — leave alone
      if (r.height > Math.min(220, window.innerHeight * 0.35)) return false;
      const fromBottom = window.innerHeight - r.bottom;
      if (fromBottom > 24) return false;

      const id = el.id || "";
      const cls = typeof el.className === "string" ? el.className : "";
      const src =
        el instanceof HTMLIFrameElement
          ? el.src || el.getAttribute("name") || ""
          : "";
      const blob = `${id} ${cls} ${src}`;
      const looksGoogle =
        /adsbygoogle|google_ads|aswift|google-auto-placed|anchor/i.test(blob) ||
        !!el.closest("ins.adsbygoogle") ||
        !!el.closest(".google-auto-placed") ||
        !!el.querySelector(
          "iframe[id*='google_ads'], iframe[name*='google_ads'], iframe[src*='googlesyndication'], iframe[src*='doubleclick']"
        );

      // Only kill confirmed Google bottom strips (not random fixed UI)
      return looksGoogle && r.width >= window.innerWidth * 0.55;
    };

    const scan = () => {
      const nodes = document.querySelectorAll<HTMLElement>(
        "ins.adsbygoogle, .google-auto-placed, iframe[id*='google_ads'], iframe[name*='google_ads'], div[id*='aswift'], body > div, body > ins"
      );
      nodes.forEach((el) => {
        if (el.id === "site-mobile-nav" || el.id === "site-content") return;
        if (el.getAttribute("data-cv-ad-zone")) return;
        if (isBottomAnchor(el)) {
          kill(el);
          return;
        }
        const parent = el.parentElement;
        if (
          parent &&
          parent !== document.body &&
          !parent.getAttribute("data-cv-ad-zone") &&
          isBottomAnchor(parent)
        ) {
          kill(parent);
        }
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
    const tick = window.setInterval(scan, 1500);
    const times = [500, 1500, 4000].map((ms) => window.setTimeout(scan, ms));
    return () => {
      mo.disconnect();
      window.clearInterval(tick);
      times.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return null;
}
