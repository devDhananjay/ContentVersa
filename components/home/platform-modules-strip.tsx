"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Clapperboard,
  Compass,
  Film,
  Gem,
  Medal,
  PenLine,
  TrendingUp,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/home/motion";
import type { HomeModulePreviews } from "@/lib/home/module-previews";
import { TOOL_REGISTRY } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

type ModuleLink = {
  label: string;
  href: string;
};

type ModuleCard = {
  name: string;
  href: string;
  tagline: string;
  description: string;
  group: "read" | "live" | "verse" | "tools";
  icon: LucideIcon;
  color: string;
  glow: string;
  badge?: string;
  previewKey?: keyof HomeModulePreviews;
  links?: ModuleLink[];
};

const TOOLS_COUNT = TOOL_REGISTRY.length;

const MODULES: ModuleCard[] = [
  {
    name: "Sports",
    href: "/sports",
    tagline: "Live cricket",
    description: "Scores, fixtures and sports stories in one place.",
    group: "live",
    icon: Medal,
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.28)",
    badge: "Live scores",
    previewKey: "sports",
  },
  {
    name: "Finance",
    href: "/finance",
    tagline: "Markets live",
    description: "Nifty, Sensex, movers and finance explainers.",
    group: "live",
    icon: TrendingUp,
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.28)",
    badge: "Markets open",
    previewKey: "finance",
  },
  {
    name: "Jobs",
    href: "/jobs",
    tagline: "Careers India",
    description: "Sarkari and private openings with career guides.",
    group: "live",
    icon: Briefcase,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.28)",
    badge: "New openings",
  },
  {
    name: "MoneyVerse",
    href: "/moneyverse",
    tagline: "Expenses & budgets",
    description: "Track UPI spends, budgets and SIP reminders.",
    group: "verse",
    icon: Wallet,
    color: "#34d399",
    glow: "rgba(52,211,153,0.28)",
    links: [
      { label: "Screenshot Scan", href: "/moneyverse/screenshot-scan" },
      { label: "Bank Statement", href: "/moneyverse/bank-statement-analyzer" },
    ],
  },
  {
    name: "GoldVerse",
    href: "/goldverse",
    tagline: "Gold rates",
    description: "City gold prices, hallmark guide and jewellery tools.",
    group: "verse",
    icon: Gem,
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.28)",
    previewKey: "gold",
    links: [{ label: "HUID Check", href: "/huid-verification" }],
  },
  {
    name: "India Tools",
    href: "/tools",
    tagline: "Free utilities",
    description: "IFSC, pincode, weather, EMI, SIP, nearby places and more.",
    group: "tools",
    icon: Wrench,
    color: "#2dd4bf",
    glow: "rgba(45,212,191,0.28)",
    badge: `${TOOLS_COUNT} free tools`,
    links: [
      { label: "IFSC", href: "/tools/ifsc-finder" },
      { label: "Weather", href: "/tools/weather" },
      { label: "EMI", href: "/tools/emi-calculator" },
      { label: "Nearby", href: "/tools/nearby-places" },
    ],
  },
  {
    name: "Articles",
    href: "/blogs",
    tagline: "Long-form stories",
    description: "Essays, explainers and ideas from Indian creators.",
    group: "read",
    icon: Compass,
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.28)",
  },
  {
    name: "Reels",
    href: "/reels",
    tagline: "Short video",
    description: "Discover creators in clips, then read their full posts.",
    group: "read",
    icon: Film,
    color: "#ec4899",
    glow: "rgba(236,72,153,0.28)",
  },
  {
    name: "CineVerse",
    href: "/cineverse",
    tagline: "Movies & OTT",
    description: "Search films, build a watchlist and get smart picks.",
    group: "read",
    icon: Clapperboard,
    color: "#818cf8",
    glow: "rgba(129,140,248,0.28)",
  },
];

const GROUPS: Array<{
  id: ModuleCard["group"];
  title: string;
  subtitle: string;
}> = [
  { id: "live", title: "Live India", subtitle: "Scores, markets and careers" },
  { id: "verse", title: "Money & gold", subtitle: "Personal finance and hallmark tools" },
  {
    id: "tools",
    title: "Everyday tools",
    subtitle: "Free India utilities — browse without signup",
  },
  { id: "read", title: "Read & watch", subtitle: "Stories, reels and movies" },
];

function ModuleCardView({
  module,
  index,
  reduce,
  preview,
}: {
  module: ModuleCard;
  index: number;
  reduce: boolean | null;
  preview?: string | null;
}) {
  const Icon = module.icon;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -4, transition: { type: "spring", stiffness: 380, damping: 22 } }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/90 p-5 shadow-lg backdrop-blur-sm md:p-6",
        module.group === "tools" && "sm:col-span-2 lg:col-span-3"
      )}
      style={{
        boxShadow: `0 0 0 1px ${module.color}22, 0 18px 40px -20px ${module.glow}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${module.color}, transparent)`,
        }}
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-3xl transition duration-500 group-hover:opacity-60"
        style={{ background: module.color }}
      />

      <Link href={module.href} className="relative flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-white/10 transition duration-300 group-hover:scale-105"
            style={{
              color: module.color,
              background: `linear-gradient(135deg, ${module.color}33, ${module.color}0d)`,
            }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex flex-col items-end gap-1.5">
            {module.badge ? (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  color: module.color,
                  borderColor: `${module.color}55`,
                  background: `${module.color}18`,
                }}
              >
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{ background: module.color }}
                />
                {module.badge}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  color: module.color,
                  borderColor: `${module.color}44`,
                  background: `${module.color}14`,
                }}
              >
                {module.tagline}
              </span>
            )}
          </div>
        </div>

        <h3 className="mt-4 font-display text-xl font-extrabold tracking-tight md:text-2xl">
          {module.name}
        </h3>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {module.description}
        </p>

        {preview ? (
          <p
            className="mt-3 rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular-nums"
            style={{
              color: module.color,
              borderColor: `${module.color}33`,
              background: `${module.color}10`,
            }}
          >
            {preview}
          </p>
        ) : null}

        <span
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold"
          style={{ color: module.color }}
        >
          Open {module.name}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>

      {module.links?.length ? (
        <div
          className={cn(
            "relative mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4",
            module.group === "tools" && "sm:flex-nowrap"
          )}
        >
          {module.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-lg border border-white/10 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-foreground/85 transition hover:border-white/25 hover:bg-background/80 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
}

/** Clear, scannable module directory for the homepage. */
export function PlatformModulesStrip({
  previews,
}: {
  previews?: HomeModulePreviews;
}) {
  const reduce = useReducedMotion();

  return (
    <section
      id="explore-modules"
      className="relative overflow-hidden border-y border-border/40"
      aria-labelledby="platform-modules-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(59,130,246,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_85%_80%,rgba(52,211,153,0.08),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-[0.12]" />

      <div className="container relative py-14 md:py-20">
        <Reveal>
          <header className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/70 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
              All modules
            </p>
            <h2
              id="platform-modules-heading"
              className="font-display text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl"
            >
              Everything on <span className="text-gradient">ContentVerse</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              Sports, finance, jobs, verses and free India tools — pick a module and go.
            </p>
          </header>
        </Reveal>

        <Reveal delay={0.04}>
          <nav
            aria-label="Jump to a module group"
            className="mb-10 flex justify-start gap-2 overflow-x-auto pb-1 md:justify-center [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {GROUPS.map((group) => (
              <a
                key={group.id}
                href={`#modules-${group.id}`}
                className="inline-flex shrink-0 items-center rounded-full border border-white/10 bg-card/80 px-3.5 py-2 text-xs font-semibold backdrop-blur transition hover:border-white/25 hover:bg-card"
              >
                {group.title}
              </a>
            ))}
          </nav>
        </Reveal>

        <div className="space-y-12">
          {GROUPS.map((group) => {
            const cards = MODULES.filter((module) => module.group === group.id);
            return (
              <div key={group.id} id={`modules-${group.id}`} className="scroll-mt-24">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold md:text-xl">{group.title}</h3>
                    <p className="text-sm text-muted-foreground">{group.subtitle}</p>
                  </div>
                  <span className="hidden h-px flex-1 bg-gradient-to-r from-white/15 to-transparent sm:block" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cards.map((module, index) => (
                    <ModuleCardView
                      key={module.href}
                      module={module}
                      index={index}
                      reduce={reduce}
                      preview={module.previewKey ? previews?.[module.previewKey] : null}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-card/80 px-6 py-5 backdrop-blur sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink text-white">
                <PenLine className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display font-bold">Want to publish on ContentVerse?</p>
                <p className="text-sm text-muted-foreground">
                  Write long-form blogs, schedule posts and grow with the community.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-neon-purple/25 transition hover:brightness-110"
            >
              Start writing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
