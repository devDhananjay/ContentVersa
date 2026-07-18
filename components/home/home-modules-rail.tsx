"use client";

import Link from "next/link";
import {
  Briefcase,
  Clapperboard,
  Compass,
  FileSearch,
  Film,
  Gem,
  Medal,
  ScanLine,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RailItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
  main?: boolean;
};

/** Main modules first, then secondary Verse / utility links. */
const RAIL: RailItem[] = [
  { href: "/sports", label: "Sports", icon: Medal, color: "#22d3ee", main: true },
  { href: "/finance", label: "Finance", icon: TrendingUp, color: "#3b82f6", main: true },
  { href: "/jobs", label: "Jobs", icon: Briefcase, color: "#f59e0b", main: true },
  { href: "/moneyverse", label: "MoneyVerse", icon: Wallet, color: "#34d399", main: true },
  { href: "/tools", label: "India Tools", icon: Wrench, color: "#2dd4bf", main: true },
  { href: "/blogs", label: "Articles", icon: Compass, color: "#8b5cf6", main: true },
  { href: "/reels", label: "Reels", icon: Film, color: "#ec4899", main: true },
  { href: "/cineverse", label: "CineVerse", icon: Clapperboard, color: "#818cf8" },
  { href: "/goldverse", label: "GoldVerse", icon: Gem, color: "#fbbf24" },
  {
    href: "/moneyverse/screenshot-scan",
    label: "Screenshot Scan",
    icon: ScanLine,
    color: "#34d399",
  },
  {
    href: "/moneyverse/bank-statement-analyzer",
    label: "Bank Statement",
    icon: FileSearch,
    color: "#2dd4bf",
  },
  {
    href: "/huid-verification",
    label: "HUID Check",
    icon: ShieldCheck,
    color: "#fbbf24",
  },
];

function ModulePill({ item }: { item: RailItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        item.main
          ? "border-white/15 bg-card shadow-sm hover:border-white/30"
          : "border-border/50 bg-card/70 hover:border-foreground/25 hover:bg-card"
      )}
    >
      <Icon className="h-3.5 w-3.5" style={{ color: item.color }} />
      {item.label}
      {item.main ? (
        <span
          className="ml-0.5 h-1.5 w-1.5 rounded-full"
          style={{ background: item.color }}
          aria-hidden
        />
      ) : null}
    </Link>
  );
}

/** Compact auto-scrolling module rail — main hubs lead the loop. */
export function HomeModulesRail() {
  const loop = [...RAIL, ...RAIL];

  return (
    <nav
      id="home-modules-rail"
      aria-label="ContentVerse modules"
      className="border-b border-border/40 bg-background/70 backdrop-blur-md"
      data-modules-rail
    >
      <div className="container flex items-center gap-3 py-2.5">
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Modules
        </span>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-6 bg-gradient-to-r from-background/95 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-6 bg-gradient-to-l from-background/95 to-transparent" />

          <div className="flex w-max items-center gap-2 animate-marquee hover:[animation-play-state:paused]">
            {loop.map((item, index) => (
              <ModulePill key={`${item.href}-${index}`} item={item} />
            ))}
          </div>
        </div>

        <Link
          href="#explore-modules"
          className="shrink-0 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:border-foreground/25 hover:text-foreground"
        >
          See all
        </Link>
      </div>
    </nav>
  );
}
