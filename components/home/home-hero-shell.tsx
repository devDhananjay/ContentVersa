"use client";

import * as React from "react";
import { HeroVideoBackground } from "@/components/home/hero-video-background";
import { AmbientPageBackground } from "@/components/site/ambient-page-background";
import { useCinematicHero } from "@/components/home/use-cinematic-hero";

export function HomeHeroShell({ children }: { children: React.ReactNode }) {
  const cinematic = useCinematicHero();

  return (
    <div className="relative isolate overflow-hidden">
      {cinematic ? (
        <div className="pointer-events-none absolute inset-0 z-0">
          <HeroVideoBackground className="h-full w-full" />
        </div>
      ) : (
        <AmbientPageBackground />
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
