"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Clapperboard,
  Compass,
  Film,
  Gem,
  BookOpen,
  Medal,
  PenLine,
  Sparkles,
  TrendingUp,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/home/motion";
import { MrecAd } from "@/components/ads/mrec-ad";
import { LocaleLink } from "@/components/i18n/locale-link";
import { useDictionary } from "@/components/i18n/use-dictionary";
import type { HomeModulePreviews } from "@/lib/home/module-previews";
import { TOOL_REGISTRY } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

type ModuleLink = {
  label: string;
  href: string;
};

type ModuleCard = {
  id: string;
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
  nameKey: string;
  tagKey: string;
  descKey: string;
  badgeKey?: string;
};

const TOOLS_COUNT = TOOL_REGISTRY.length;

/** Theme-safe text colour: blends the module hue toward the foreground. */
const textTone = (hex: string) =>
  `color-mix(in srgb, ${hex} 62%, hsl(var(--foreground)))`;

const MODULES: ModuleCard[] = [
  {
    id: "ai",
    name: "ContentVerse India AI",
    href: "/ai",
    tagline: "AI product",
    description:
      "Ask, summarise, explain, compare, resume, finance, bank PDF & screenshot OCR.",
    group: "tools",
    icon: Sparkles,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.35)",
    badge: "New product",
    nameKey: "home.modAiName",
    tagKey: "home.modAiTag",
    descKey: "home.modAiDesc",
    badgeKey: "home.modAiBadge",
    links: [
      { label: "Bank PDF", href: "/ai?mode=bank-statement" },
      { label: "Resume", href: "/ai?mode=resume" },
      { label: "Screenshot", href: "/ai?mode=screenshot" },
    ],
  },
  {
    id: "sports",
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
    nameKey: "home.modSportsName",
    tagKey: "home.modSportsTag",
    descKey: "home.modSportsDesc",
    badgeKey: "home.modSportsBadge",
  },
  {
    id: "finance",
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
    nameKey: "home.modFinanceName",
    tagKey: "home.modFinanceTag",
    descKey: "home.modFinanceDesc",
    badgeKey: "home.modFinanceBadge",
  },
  {
    id: "jobs",
    name: "Jobs",
    href: "/jobs",
    tagline: "Careers India",
    description: "Sarkari and private openings with career guides.",
    group: "live",
    icon: Briefcase,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.28)",
    badge: "New openings",
    nameKey: "home.modJobsName",
    tagKey: "home.modJobsTag",
    descKey: "home.modJobsDesc",
    badgeKey: "home.modJobsBadge",
  },
  {
    id: "guides",
    name: "India Guides",
    href: "/guides",
    tagline: "Search formats",
    description: "Trends, schemes, jobs, cricket, AI tools and OTT explainers.",
    group: "read",
    icon: BookOpen,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.28)",
    badge: "New hub",
    nameKey: "home.modGuidesName",
    tagKey: "home.modGuidesTag",
    descKey: "home.modGuidesDesc",
    badgeKey: "home.modGuidesBadge",
    links: [
      { label: "Govt Schemes", href: "/guides/schemes" },
      { label: "Trending", href: "/guides/trending" },
      { label: "Jobs guides", href: "/guides/jobs" },
    ],
  },
  {
    id: "moneyverse",
    name: "MoneyVerse",
    href: "/moneyverse",
    tagline: "Expenses & budgets",
    description: "Track UPI spends, budgets and SIP reminders.",
    group: "verse",
    icon: Wallet,
    color: "#34d399",
    glow: "rgba(52,211,153,0.28)",
    nameKey: "home.modMoneyverseName",
    tagKey: "home.modMoneyverseTag",
    descKey: "home.modMoneyverseDesc",
    links: [
      { label: "Screenshot Scan", href: "/moneyverse/screenshot-scan" },
      { label: "Bank Statement", href: "/moneyverse/bank-statement-analyzer" },
    ],
  },
  {
    id: "goldverse",
    name: "GoldVerse",
    href: "/goldverse",
    tagline: "Gold rates",
    description: "City gold prices, hallmark guide and jewellery tools.",
    group: "verse",
    icon: Gem,
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.28)",
    previewKey: "gold",
    nameKey: "home.modGoldverseName",
    tagKey: "home.modGoldverseTag",
    descKey: "home.modGoldverseDesc",
    links: [{ label: "HUID Check", href: "/huid-verification" }],
  },
  {
    id: "tools",
    name: "India Tools",
    href: "/tools",
    tagline: "Free utilities",
    description: "IFSC, pincode, weather, EMI, SIP, nearby places and more.",
    group: "tools",
    icon: Wrench,
    color: "#2dd4bf",
    glow: "rgba(45,212,191,0.28)",
    badge: `${TOOLS_COUNT} free tools`,
    nameKey: "home.modToolsName",
    tagKey: "home.modToolsTag",
    descKey: "home.modToolsDesc",
    badgeKey: "home.modToolsBadge",
    links: [
      { label: "IFSC", href: "/tools/ifsc-finder" },
      { label: "Weather", href: "/tools/weather" },
      { label: "EMI", href: "/tools/emi-calculator" },
      { label: "Nearby", href: "/tools/nearby-places" },
    ],
  },
  {
    id: "articles",
    name: "Articles",
    href: "/blogs",
    tagline: "Long-form stories",
    description: "Essays, explainers and ideas from Indian creators.",
    group: "read",
    icon: Compass,
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.28)",
    nameKey: "home.modArticlesName",
    tagKey: "home.modArticlesTag",
    descKey: "home.modArticlesDesc",
  },
  {
    id: "reels",
    name: "Reels",
    href: "/reels",
    tagline: "Short video",
    description: "Discover creators in clips, then read their full posts.",
    group: "read",
    icon: Film,
    color: "#ec4899",
    glow: "rgba(236,72,153,0.28)",
    nameKey: "home.modReelsName",
    tagKey: "home.modReelsTag",
    descKey: "home.modReelsDesc",
  },
  {
    id: "cineverse",
    name: "CineVerse",
    href: "/cineverse",
    tagline: "Movies & OTT",
    description: "Search films, build a watchlist and get smart picks.",
    group: "read",
    icon: Clapperboard,
    color: "#818cf8",
    glow: "rgba(129,140,248,0.28)",
    nameKey: "home.modCineName",
    tagKey: "home.modCineTag",
    descKey: "home.modCineDesc",
  },
];

const GROUPS: Array<{
  id: ModuleCard["group"];
  title: string;
  subtitle: string;
  titleKey: string;
  subtitleKey: string;
}> = [
  {
    id: "live",
    title: "Live India",
    subtitle: "Scores, markets and careers",
    titleKey: "home.groupLive",
    subtitleKey: "home.groupLiveSub",
  },
  {
    id: "verse",
    title: "Money & gold",
    subtitle: "Personal finance and hallmark tools",
    titleKey: "home.groupVerse",
    subtitleKey: "home.groupVerseSub",
  },
  {
    id: "tools",
    title: "Everyday tools",
    subtitle: "Free India utilities — browse without signup",
    titleKey: "home.groupTools",
    subtitleKey: "home.groupToolsSub",
  },
  {
    id: "read",
    title: "Read & watch",
    subtitle: "Stories, reels and movies",
    titleKey: "home.groupRead",
    subtitleKey: "home.groupReadSub",
  },
];

function ModuleCardView({
  module,
  index,
  reduce,
  preview,
  t,
}: {
  module: ModuleCard;
  index: number;
  reduce: boolean | null;
  preview?: string | null;
  t: (key: string, fallback?: string) => string;
}) {
  const Icon = module.icon;
  const tone = textTone(module.color);
  const name = t(module.nameKey, module.name);
  const tagline = t(module.tagKey, module.tagline);
  const description = t(module.descKey, module.description);
  const badge = module.badgeKey
    ? t(module.badgeKey, module.badge).replace("{n}", String(TOOLS_COUNT))
    : module.badge;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -4, transition: { type: "spring", stiffness: 380, damping: 22 } }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-5 md:p-6",
        module.group === "tools" && "sm:col-span-2 lg:col-span-3"
      )}
      style={{
        boxShadow: `var(--v2-shadow-md), 0 18px 40px -22px ${module.glow}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${module.color}, transparent)`,
        }}
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition duration-500 group-hover:opacity-45"
        style={{ background: module.color }}
      />

      <LocaleLink href={module.href} className="relative flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-border transition duration-300 group-hover:scale-105"
            style={{
              color: tone,
              background: `linear-gradient(135deg, ${module.color}33, ${module.color}0d)`,
            }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex flex-col items-end gap-1.5">
            {badge ? (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  color: tone,
                  borderColor: `${module.color}55`,
                  background: `${module.color}18`,
                }}
              >
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{ background: module.color }}
                />
                {badge}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  color: tone,
                  borderColor: `${module.color}44`,
                  background: `${module.color}14`,
                }}
              >
                {tagline}
              </span>
            )}
          </div>
        </div>

        <h3 className="mt-4 font-display text-xl font-bold tracking-tight md:text-2xl">
          {name}
        </h3>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {preview ? (
          <p
            className="mt-3 rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular-nums"
            style={{
              color: tone,
              borderColor: `${module.color}33`,
              background: `${module.color}10`,
            }}
          >
            {preview}
          </p>
        ) : null}

        <span
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold"
          style={{ color: tone }}
        >
          {name}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </LocaleLink>

      {module.links?.length ? (
        <div
          className={cn(
            "relative mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4",
            module.group === "tools" && "sm:flex-nowrap"
          )}
        >
          {module.links.map((link) => (
            <LocaleLink
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground/85 transition hover:border-primary/40 hover:bg-background hover:text-foreground"
            >
              {link.label}
            </LocaleLink>
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
  const { t } = useDictionary();

  return (
    <section
      id="explore-modules"
      className="relative overflow-hidden border-y border-border/60 bg-muted/40"
      aria-labelledby="platform-modules-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,hsl(var(--primary)/0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_85%_80%,hsl(var(--saffron)/0.1),transparent_50%)]" />
      <div className="v2-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]" />

      <div className="container relative py-14 md:py-20">
        <Reveal>
          <header className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
              {t("home.modulesEyebrow")}
            </p>
            <h2
              id="platform-modules-heading"
              className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl lg:text-5xl"
            >
              {t("home.modulesTitle")}{" "}
              <span className="text-gradient">{t("home.modulesTitleBrand")}</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              {t("home.modulesSub")}
            </p>
          </header>
        </Reveal>

        <Reveal delay={0.04}>
          <nav
            aria-label={t("home.modulesEyebrow")}
            className="mb-10 flex justify-start gap-2 overflow-x-auto pb-1 md:justify-center [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {GROUPS.map((group) => (
              <a
                key={group.id}
                href={`#modules-${group.id}`}
                className="inline-flex shrink-0 items-center rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold shadow-sm transition hover:border-primary/40"
              >
                {t(group.titleKey, group.title)}
              </a>
            ))}
          </nav>
        </Reveal>

        <div className="space-y-12">
          {GROUPS.map((group) => {
            const cards = MODULES.filter((module) => module.group === group.id);
            // Empty cells in the last row on desktop (tools cards are full-width)
            const emptyCells =
              group.id === "tools" ? 0 : (3 - (cards.length % 3)) % 3;
            return (
              <div key={group.id} id={`modules-${group.id}`} className="scroll-mt-24">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold md:text-xl">
                      {t(group.titleKey, group.title)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(group.subtitleKey, group.subtitle)}
                    </p>
                  </div>
                  <span className="hidden h-px flex-1 bg-gradient-to-r from-border to-transparent sm:block" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cards.map((module, index) => (
                    <ModuleCardView
                      key={module.href}
                      module={module}
                      index={index}
                      reduce={reduce}
                      preview={module.previewKey ? previews?.[module.previewKey] : null}
                      t={t}
                    />
                  ))}
                  {emptyCells > 0 ? (
                    <div
                      className={cn(
                        "hidden items-center justify-center lg:flex",
                        emptyCells === 2 ? "lg:col-span-2" : "lg:col-span-1"
                      )}
                    >
                      <MrecAd slotKey="hub" />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-start justify-between gap-4 v2-raised px-6 py-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <PenLine className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display font-bold">{t("home.publishTitle")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("home.publishSub")}
                </p>
              </div>
            </div>
            <LocaleLink
              href="/dashboard/create"
              className="inline-flex items-center gap-2 v2-btn-primary rounded-full px-5 py-2.5 text-sm font-bold transition"
            >
              {t("home.publishCta")}
              <ArrowRight className="h-4 w-4" />
            </LocaleLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
