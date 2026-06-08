"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function FinanceAutoRefresh({
  intervalMs = 300_000,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    function shouldRefresh() {
      if (typeof document === "undefined") return false;
      return document.visibilityState === "visible";
    }

    function tick() {
      if (shouldRefresh()) router.refresh();
    }

    intervalRef.current = setInterval(tick, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs, router]);

  return null;
}

