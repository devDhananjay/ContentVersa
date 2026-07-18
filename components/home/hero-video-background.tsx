"use client";

import * as React from "react";
import { homeHeroVideoUrl, isHomeHeroVideoEnabled } from "@/lib/site/home-hero-video";
import { cn } from "@/lib/utils";

/** Keep hero video playing — resume after tab focus, stall, or accidental pause. */
function usePersistentVideoPlayback(videoRef: React.RefObject<HTMLVideoElement | null>) {
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      if (video.ended) {
        video.currentTime = 0;
      }
      void video.play().catch(() => {
        // Browser may block until next gesture — retry once on interaction
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") play();
    };

    const onPause = () => {
      // Background loops should not stay paused (unless tab hidden)
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
  }, [videoRef]);
}

export function HeroVideoBackground({ className }: { className?: string }) {
  const enabled = isHomeHeroVideoEnabled();
  const url = homeHeroVideoUrl();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = React.useState(false);

  usePersistentVideoPlayback(videoRef);

  if (!enabled) return null;

  return (
    <div className={cn("hero-video-active absolute inset-0 overflow-hidden", className)} aria-hidden>
      {!failed ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          className="absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover object-center scale-[1.35] sm:scale-[1.4] lg:scale-[1.45]"
          onError={() => setFailed(true)}
        >
          <source src={url} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-background" />
      )}

      {/* Overlays — keep text readable without washing out the zoomed video */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-background/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.35)_100%)]" />
      <div className="absolute inset-0 opacity-[0.07] grid-noise" />
    </div>
  );
}
