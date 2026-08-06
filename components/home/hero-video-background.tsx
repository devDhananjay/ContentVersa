"use client";

import * as React from "react";
import { homeHeroVideoUrl, isHomeHeroVideoEnabled } from "@/lib/site/home-hero-video";
import { cn } from "@/lib/utils";

type ConnectionLike = {
  saveData?: boolean;
  effectiveType?: string;
};

function shouldLoadHeroVideo(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // Background autoplay video wrecks mobile LCP / data — keep gradient on phones
  if (window.matchMedia("(max-width: 767px)").matches) return false;
  const conn = (navigator as Navigator & { connection?: ConnectionLike }).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return false;
  return true;
}

/** Keep hero video playing — resume after tab focus, stall, or accidental pause. */
function usePersistentVideoPlayback(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean
) {
  React.useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      if (video.ended) video.currentTime = 0;
      void video.play().catch(() => {});
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") play();
    };

    const onPause = () => {
      if (document.visibilityState === "visible") {
        window.requestAnimationFrame(play);
      }
    };

    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", play);
    video.addEventListener("stalled", play);
    video.addEventListener("waiting", play);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", play);

    play();

    return () => {
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", play);
      video.removeEventListener("stalled", play);
      video.removeEventListener("waiting", play);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", play);
    };
  }, [videoRef, active]);
}

function GradientFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-background" />
  );
}

export function HeroVideoBackground({ className }: { className?: string }) {
  const enabled = isHomeHeroVideoEnabled();
  const url = homeHeroVideoUrl();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = React.useState(false);
  const [src, setSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!enabled) return;
    if (!shouldLoadHeroVideo()) return;

    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const arm = () => {
      if (cancelled) return;
      setSrc(url);
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(arm, { timeout: 1800 });
    } else {
      timeoutId = setTimeout(arm, 900);
    }

    return () => {
      cancelled = true;
      if (idleId != null) win.cancelIdleCallback?.(idleId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [enabled, url]);

  usePersistentVideoPlayback(videoRef, Boolean(src) && !failed);

  if (!enabled) return null;

  return (
    <div className={cn("hero-video-active absolute inset-0 overflow-hidden", className)} aria-hidden>
      {src && !failed ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          controls={false}
          className="absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover object-center scale-[1.35] sm:scale-[1.4] lg:scale-[1.45]"
          onError={() => setFailed(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <GradientFallback />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-background/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.35)_100%)]" />
      <div className="absolute inset-0 opacity-[0.07] grid-noise" />
    </div>
  );
}
