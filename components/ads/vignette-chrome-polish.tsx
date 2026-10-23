"use client";

import * as React from "react";

const ATTR = "data-cv-vignette-polished";
/** YourStory-style: light blur so article stays faintly readable */
const SOFT_BLUR = "blur(2px)";

function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function parseBlurPx(value: string): number | null {
  const m = value.match(/blur\(\s*([0-9.]+)px\s*\)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function softenFilter(el: HTMLElement, prop: "filter" | "backdrop-filter") {
  const style = getComputedStyle(el);
  const raw =
    prop === "filter"
      ? style.filter
      : style.backdropFilter ||
        (style as CSSStyleDeclaration & { webkitBackdropFilter?: string })
          .webkitBackdropFilter ||
        "";
  if (!raw || raw === "none") return;
  const px = parseBlurPx(raw);
  if (px == null || px <= 2.5) return;
  const next = raw.replace(/blur\(\s*[0-9.]+px\s*\)/gi, SOFT_BLUR);
  el.style.setProperty(prop, next, "important");
  if (prop === "backdrop-filter") {
    el.style.setProperty("-webkit-backdrop-filter", next, "important");
  }
}

function isLikelyVignetteRoot(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  if (style.position !== "fixed" && style.position !== "absolute") return false;
  const r = el.getBoundingClientRect();
  if (r.width < window.innerWidth * 0.8 || r.height < window.innerHeight * 0.55) {
    return false;
  }
  const hasAdFrame = !!el.querySelector(
    "iframe[id*='google_ads'], iframe[name*='google_ads'], iframe[src*='googlesyndication'], iframe[src*='doubleclick'], ins.adsbygoogle"
  );
  const text = (el.innerText || "").slice(0, 120);
  const hasClose =
    /\bClose\b/i.test(text) ||
    !!el.querySelector(
      '[aria-label*="close" i], [aria-label*="Dismiss" i], [title*="Close" i]'
    );
  return hasAdFrame || hasClose;
}

/** Dim scrim like YourStory — page visible underneath, not frosted white-out */
function styleOverlay(el: HTMLElement) {
  el.style.setProperty(
    "background-color",
    isMobile() ? "rgba(0, 0, 0, 0.48)" : "rgba(15, 15, 20, 0.36)",
    "important"
  );
  el.style.setProperty("backdrop-filter", SOFT_BLUR, "important");
  el.style.setProperty("-webkit-backdrop-filter", SOFT_BLUR, "important");
  softenFilter(el, "filter");
}

/**
 * Enlarge / center the vignette card.
 * Mobile: ~90vw wide card (YS-style). Desktop: modest scale-up.
 */
function enlargeAdCard(root: HTMLElement) {
  const frames = root.querySelectorAll<HTMLElement>(
    "iframe[id*='google_ads'], iframe[name*='google_ads'], iframe[src*='googlesyndication'], iframe[src*='doubleclick'], ins.adsbygoogle"
  );
  const mobile = isMobile();
  frames.forEach((frame) => {
    let host =
      (frame.closest("div, section, aside") as HTMLElement | null) || frame;
    // Prefer a sized parent, not the full-screen root
    if (host === root) host = frame;

    if (host.getAttribute(ATTR) === "scaled") return;

    if (mobile) {
      const targetW = Math.min(window.innerWidth * 0.9, 400);
      host.style.setProperty("width", `${Math.round(targetW)}px`, "important");
      host.style.setProperty("max-width", "90vw", "important");
      host.style.setProperty("margin-left", "auto", "important");
      host.style.setProperty("margin-right", "auto", "important");
      host.style.setProperty("transform", "scale(1.06)", "important");
      host.style.setProperty("transform-origin", "center center", "important");
      if (frame.tagName === "IFRAME") {
        frame.style.setProperty("width", "100%", "important");
        frame.style.setProperty("max-width", "100%", "important");
      }
    } else {
      host.style.setProperty("transform", "scale(1.3)", "important");
      host.style.setProperty("transform-origin", "center center", "important");
    }
    host.setAttribute(ATTR, "scaled");
  });
}

function polish() {
  if (typeof document === "undefined") return;

  const shell = document.getElementById("site-content");
  if (shell) {
    softenFilter(shell, "filter");
    softenFilter(shell, "backdrop-filter");
  }

  document.querySelectorAll<HTMLElement>("body > *").forEach((el) => {
    if (el.id === "site-content") return;
    // Don't restyle our own sticky / nav chrome
    if (
      el.id === "site-mobile-nav" ||
      el.getAttribute("data-cv-ad-zone") === "mobile-sticky-bottom"
    ) {
      return;
    }
    if (isLikelyVignetteRoot(el)) {
      styleOverlay(el);
      enlargeAdCard(el);
      el.querySelectorAll<HTMLElement>("div, section, aside").forEach((child) => {
        softenFilter(child, "backdrop-filter");
        softenFilter(child, "filter");
      });
      return;
    }
    softenFilter(el, "filter");
  });
}

/**
 * AdSense vignette chrome — YourStory-like mobile/desktop presentation:
 * soft dim (page still visible) + larger centered card.
 * Leak recovery stays in VignetteJsLeakGuard.
 */
export function VignetteChromePolish() {
  React.useEffect(() => {
    polish();
    let t = 0;
    const schedule = () => {
      window.clearTimeout(t);
      t = window.setTimeout(polish, 120);
    };
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    const times = [400, 1200, 3000, 6000].map((ms) =>
      window.setTimeout(polish, ms)
    );
    return () => {
      mo.disconnect();
      window.clearTimeout(t);
      times.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return null;
}
