"use client";

import * as React from "react";
import { HeroVideoBackground } from "@/components/home/hero-video-background";
import { AmbientPageBackground } from "@/components/site/ambient-page-background";
import { isHomeHeroVideoEnabled } from "@/lib/site/home-hero-video";
import { cn } from "@/lib/utils";

/**
 * Cinematic video is a dark-mode-only layer. Light mode (and dark without the
 * video flag) uses the theme-aware aurora so both themes are first-class.
 */
export function HomeHeroShell({ children }: { children: React.ReactNode }) {
  const cinematic = isHomeHeroVideoEnabled();

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden [clip-path:inset(0)]",
        cinematic && "dark:min-h-[100svh] dark:-mt-[var(--site-header-offset)]"
      )}
    >
      {cinematic ? (
        <div className="pointer-events-none absolute inset-0 z-0 hidden dark:block">
          <HeroVideoBackground className="h-full w-full" />
        </div>
      ) : null}
      <AmbientPageBackground className={cn(cinematic && "dark:hidden")} />
      <div
        className={cn(
          "relative z-[1]",
          cinematic && [
            "dark:pt-[var(--site-header-offset)]",
            "dark:[&_[data-reels-strip]]:border-white/10 dark:[&_[data-reels-strip]]:bg-black/30 dark:[&_[data-reels-strip]]:backdrop-blur-md",
          ]
        )}
      >
        {children}
      </div>
    </div>
  );
}
