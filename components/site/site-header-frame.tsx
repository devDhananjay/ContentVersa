"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
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
  const immersive = isHome && !scrolled;

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
          : "border-b border-border/50 bg-background/88 backdrop-blur-2xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.45)]"
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
