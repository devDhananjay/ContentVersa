"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";

const HEARTBEAT_SEC = 15;

function scrollProgress(): number {
  const el = document.documentElement;
  const scrollTop = el.scrollTop || document.body.scrollTop;
  const height = el.scrollHeight - el.clientHeight;
  if (height <= 0) return 0;
  return Math.min(100, Math.round((scrollTop / height) * 100));
}

/** Records reading time + scroll progress; shows live timer on article. */
export function TrackBlogRead({ blogSlug }: { blogSlug: string }) {
  const [articleSeconds, setArticleSeconds] = React.useState(0);
  const [totalSeconds, setTotalSeconds] = React.useState<number | null>(null);
  const visibleRef = React.useRef(true);
  const sentRef = React.useRef(0);

  const ping = React.useCallback(
    async (seconds: number, useBeacon = false) => {
      const progress = scrollProgress();
      const payload = JSON.stringify({ seconds, progress });
      const url = `/api/blogs/${encodeURIComponent(blogSlug)}/history`;

      if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
        return;
      }

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: payload,
        });
        const data = (await res.json()) as {
          articleSeconds?: number;
          totalReadingSeconds?: number;
        };
        if (typeof data.articleSeconds === "number") {
          setArticleSeconds(data.articleSeconds);
        }
        if (typeof data.totalReadingSeconds === "number") {
          setTotalSeconds(data.totalReadingSeconds);
        }
      } catch {
        /* ignore */
      }
    },
    [blogSlug]
  );

  React.useEffect(() => {
    ping(0);

    fetch(`/api/blogs/${encodeURIComponent(blogSlug)}/history`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data: { articleSeconds?: number; totalReadingSeconds?: number }) => {
        if (typeof data.articleSeconds === "number") setArticleSeconds(data.articleSeconds);
        if (typeof data.totalReadingSeconds === "number") {
          setTotalSeconds(data.totalReadingSeconds);
        }
      })
      .catch(() => {});

    const onVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);

    const interval = window.setInterval(() => {
      if (!visibleRef.current) return;
      sentRef.current += HEARTBEAT_SEC;
      ping(HEARTBEAT_SEC);
    }, HEARTBEAT_SEC * 1000);

    const onScroll = () => {
      if (sentRef.current % HEARTBEAT_SEC !== 0) {
        ping(0);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onLeave = () => {
      ping(HEARTBEAT_SEC, true);
    };
    window.addEventListener("pagehide", onLeave);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onLeave);
      ping(HEARTBEAT_SEC, true);
    };
  }, [blogSlug, ping]);

  if (articleSeconds < 5 && (totalSeconds == null || totalSeconds < 5)) {
    return null;
  }

  return (
    <p className="mt-3 text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        Reading this article: {formatDuration(articleSeconds)}
      </span>
      {totalSeconds != null && totalSeconds > 0 && (
        <span>Total reading time: {formatDuration(totalSeconds)}</span>
      )}
    </p>
  );
}
