"use client";

import * as React from "react";

/**
 * iOS Safari + AdSense vignette bug: a broken creative (or closing the ad) can
 * dump raw Google Closure JS (`window.dicnf…`) as a full-screen layer — or as
 * the whole document. Scrub the overlay or bounce back to a real page.
 */
function isDicnfText(text: string): boolean {
  const head = text.trim().slice(0, 500);
  return (
    (head.includes("window.dicnf") || head.includes("CLOSURE_FLAGS")) &&
    (head.match(/function|var |CLOSURE_/g) || []).length >= 3
  );
}

function scrubDicnfOverlays(): boolean {
  if (typeof document === "undefined") return false;
  let removed = false;
  const nodes = document.body?.querySelectorAll("div, section, aside, dialog, main") ?? [];
  for (const el of Array.from(nodes)) {
    const text = el.textContent || "";
    if (!isDicnfText(text)) continue;
    // Prefer large / fixed layers (vignette chrome), not tiny accidental matches.
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const big =
      rect.height > window.innerHeight * 0.4 ||
      rect.width > window.innerWidth * 0.5 ||
      style.position === "fixed" ||
      style.position === "sticky";
    if (!big) continue;
    el.remove();
    removed = true;
  }
  if (removed) {
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("position");
    document.body.style.removeProperty("position");
  }
  return removed;
}

function documentIsPureDicnfLeak(): boolean {
  if (typeof document === "undefined") return false;
  const text = (document.body?.innerText || "").trim();
  if (!isDicnfText(text)) return false;
  const hasSiteChrome =
    !!document.getElementById("site-content") &&
    !!document.getElementById("main-content");
  // Pure leak page: no app shell, or shell text drowned by script dump.
  if (!hasSiteChrome) return true;
  return text.length < 3500 && text.trimStart().startsWith("window.dicnf");
}

function recoverFromLeak() {
  try {
    if (window.history.length > 1) {
      window.history.back();
      window.setTimeout(() => {
        if (documentIsPureDicnfLeak() || scrubDicnfOverlays()) {
          if (documentIsPureDicnfLeak()) window.location.replace("/");
        }
      }, 600);
      return;
    }
  } catch {
    /* fall through */
  }
  window.location.replace("/");
}

export function VignetteJsLeakGuard() {
  React.useEffect(() => {
    const check = () => {
      if (scrubDicnfOverlays()) return;
      if (documentIsPureDicnfLeak()) recoverFromLeak();
    };
    check();
    const t1 = window.setTimeout(check, 300);
    const t2 = window.setTimeout(check, 1200);
    const t3 = window.setTimeout(check, 3000);
    const onVis = () => {
      if (document.visibilityState === "visible") check();
    };
    // Vignette often injects after first paint / navigation.
    let moTimer = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(moTimer);
      moTimer = window.setTimeout(check, 200);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(moTimer);
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return null;
}
