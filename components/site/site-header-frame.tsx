"use client";

import { Navbar } from "./navbar";
import { HeaderHeightSync } from "./header-height-sync";

export function SiteHeaderFrame({
  logoSrc,
  marketStrip,
}: {
  logoSrc: string;
  marketStrip: React.ReactNode;
}) {
  return (
    <div
      id="site-header"
      data-immersive="false"
      className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/88 backdrop-blur-2xl shadow-[0_8px_28px_-16px_hsl(var(--foreground)/0.18)]"
    >
      <HeaderHeightSync />
      <Navbar embedded logoSrc={logoSrc} />
      <div>{marketStrip}</div>
    </div>
  );
}
