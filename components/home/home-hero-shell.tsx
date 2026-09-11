"use client";

import * as React from "react";
import { HeroVideoBackground } from "@/components/home/hero-video-background";
import { AmbientPageBackground } from "@/components/site/ambient-page-background";
import { isHomeHeroVideoEnabled } from "@/lib/site/home-hero-video";
import { cn } from "@/lib/utils";

export function HomeHeroShell({ children }: { children: React.ReactNode }) {
  const cinematic = isHomeHeroVideoEnabled();

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden",
        cinematic && "min-h-[100svh] -mt-[var(--site-header-offset)]"
      )}
    >
      {cinematic ? (
        <div className="pointer-events-none absolute inset-0 z-0">
          <HeroVideoBackground className="h-full w-full" />
        </div>
      ) : (
        <AmbientPageBackground />
      )}
      <div
        className={cn(
          "relative z-[1]",
          cinematic && [
            "pt-[var(--site-header-offset)]",
            "[&_[data-reels-strip]]:border-white/10 [&_[data-reels-strip]]:bg-black/30 [&_[data-reels-strip]]:backdrop-blur-md",
          ]
        )}
      >
        {children}
      </div>
    </div>
  );
}
