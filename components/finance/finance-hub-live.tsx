"use client";

import * as React from "react";
import { FINANCE_HUB_POLL_MS } from "@/lib/finance/constants";
import type { FinanceHubData } from "@/lib/finance/types";
import { FinanceDashboard } from "./finance-dashboard";

export function FinanceHubLive({
  initialData,
}: {
  initialData: FinanceHubData;
}) {
  const [data, setData] = React.useState<FinanceHubData>(initialData);
  const lastTsRef = React.useRef<string>(initialData.updatedAt);

  React.useEffect(() => {
    const ac = new AbortController();

    async function tick() {
      if (document.visibilityState !== "visible") return;

      try {
        const res = await fetch("/api/finance/hub", {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const next = (await res.json()) as FinanceHubData;
        if (next.updatedAt !== lastTsRef.current) {
          lastTsRef.current = next.updatedAt;
          setData(next);
        }
      } catch {
        // Ignore transient network failures during polling.
      }
    }

    void tick();
    const timer = setInterval(() => void tick(), FINANCE_HUB_POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      ac.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <FinanceDashboard data={data} />;
}

