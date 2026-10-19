"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { isHomeHeroVideoEnabled } from "@/lib/site/home-hero-video";
import { Navbar } from "./navbar";
import { HeaderHeightSync } from "./header-height-sync";
import { cn } from "@/lib/utils";

export function SiteHeaderFrame({
  logoSrc,
  marketStrip,
}: {
  logoSrc: string;
  marketStrip: React.ReactNode;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const isHome = pathname === "/";
  const { resolvedTheme } = useTheme();
  // Immersive (white-on-video) header only exists in dark mode with the hero
  // video enabled. Light mode keeps the normal paper header over the aurora.
  const immersive =
    isHome && !scrolled && isHomeHeroVideoEnabled() && resolvedTheme !== "light";

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <div
      id="site-header"
      data-immersive={immersive ? "true" : "false"}
      className={cn(
        "fixed top-0 inset-x-0 z-50 overflow-x-hidden transition-[background-color,box-shadow,border-color] duration-500",
        immersive
          ? "border-b border-white/10 bg-gradient-to-b from-black/70 via-black/35 to-transparent shadow-none"
          : "border-b border-border/70 bg-background shadow-[0_8px_30px_-14px_hsl(235_30%_20%/0.18)] dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.65)]"
      )}
    >
      <HeaderHeightSync />
      <Navbar embedded logoSrc={logoSrc} immersive={immersive} />
      <div
        className={cn(
          "transition-colors duration-500",
          immersive && "border-t border-white/5 bg-black/25 backdrop-blur-md"
        )}
      >
        {marketStrip}
      </div>
    </div>
  );
}
