"use client";

import { useTheme } from "next-themes";
import { isHomeHeroVideoEnabled } from "@/lib/site/home-hero-video";

/**
 * Dark video hero + white-on-dark nav only in dark mode.
 * Light mode always uses the themed editorial homepage.
 */
export function useCinematicHero() {
  const { resolvedTheme } = useTheme();
  return isHomeHeroVideoEnabled() && resolvedTheme === "dark";
}
