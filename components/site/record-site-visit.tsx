"use client";

import * as React from "react";

const SESSION_FLAG = "cv_site_visit_sent";

/** Records one site visit per browser tab session (footer count). */
export function RecordSiteVisit() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_FLAG)) return;
    sessionStorage.setItem(SESSION_FLAG, "1");

    fetch("/api/site/visit", { method: "POST", credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { uniqueVisitors?: number } | null) => {
        if (typeof data?.uniqueVisitors === "number") {
          window.dispatchEvent(
            new CustomEvent("cv-site-visit", {
              detail: { uniqueVisitors: data.uniqueVisitors },
            })
          );
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
