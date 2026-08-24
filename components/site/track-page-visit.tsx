"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "cv_page_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Tracks page visits for logged-in users.
 * Records path, referrer, and time spent on each page.
 */
export function TrackPageVisit() {
  const pathname = usePathname();
  const enteredAt = React.useRef(Date.now());
  const lastPath = React.useRef<string | null>(null);

  const sendVisit = React.useCallback(
    (path: string, duration: number, referrer: string | null) => {
      const sessionId = getSessionId();
      if (!sessionId) return;
      const body = JSON.stringify({ path, sessionId, referrer, duration });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/user/page-visit", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/user/page-visit", { method: "POST", body, keepalive: true }).catch(() => {});
      }
    },
    []
  );

  React.useEffect(() => {
    const prev = lastPath.current;
    const prevEntered = enteredAt.current;

    if (prev && prev !== pathname) {
      const duration = Math.round((Date.now() - prevEntered) / 1000);
      sendVisit(prev, duration, null);
    }

    lastPath.current = pathname;
    enteredAt.current = Date.now();
  }, [pathname, sendVisit]);

  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (lastPath.current) {
        const duration = Math.round((Date.now() - enteredAt.current) / 1000);
        sendVisit(lastPath.current, duration, document.referrer || null);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sendVisit]);

  return null;
}
