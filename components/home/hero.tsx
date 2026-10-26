"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BookOpen, Megaphone, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StickyRailAd } from "@/components/ads/sticky-rail-ad";
import { SiteVoiceSearch } from "@/components/search/site-voice-search";
import { LocaleLink } from "@/components/i18n/locale-link";
import { useDictionary } from "@/components/i18n/use-dictionary";
import type { CategoryWithCount } from "@/lib/data/home-data";
import { categoryPageHref } from "@/lib/data/categories";
import { isHomeHeroVideoEnabled } from "@/lib/site/home-hero-video";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * Typewriter without a reserved “longest-word” slot — that caused a visible
 * gap before the rest of the line when a shorter word (e.g. Build) was shown.
 */
function TypewriterWord({ words, reduce }: { words: string[]; reduce: boolean | null }) {
  const [wordIndex, setWordIndex] = React.useState(0);
  const [text, setText] = React.useState(words[0] ?? "");
  const [phase, setPhase] = React.useState<"typing" | "pause" | "deleting">("typing");

  React.useEffect(() => {
    if (reduce) {
      setText(words[wordIndex] ?? "");
      const t = setInterval(
        () => setWordIndex((i) => (i + 1) % words.length),
        2400
      );
      return () => clearInterval(t);
    }

    const full = words[wordIndex] ?? "";
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < full.length) {
        timeout = setTimeout(() => setText(full.slice(0, text.length + 1)), 70);
      } else {
        timeout = setTimeout(() => setPhase("pause"), 1600);
      }
    } else if (phase === "pause") {
      timeout = setTimeout(() => setPhase("deleting"), 200);
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 40);
      } else {
        setWordIndex((i) => (i + 1) % words.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [text, phase, wordIndex, words, reduce]);

  React.useEffect(() => {
    if (reduce) setText(words[wordIndex] ?? "");
  }, [wordIndex, words, reduce]);

  const display = reduce ? words[wordIndex] : text;

  return (
    <span className="text-gradient inline-flex items-baseline whitespace-nowrap">
      <span>{display}</span>
      <motion.span
        aria-hidden
        className="ml-[2px] inline-block h-[0.78em] w-[2px] translate-y-[0.06em] rounded-[1px] bg-gradient-to-b from-primary to-[hsl(var(--saffron))]"
        animate={reduce ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
        transition={
          reduce
            ? undefined
            : { duration: 1, repeat: Infinity, times: [0, 0.45, 0.55, 1], ease: "linear" }
        }
      />
    </span>
  );
}

export type HeroTrendKeyword = {
  title: string;
  href: string;
  traffic?: string;
};

/** Keyword links in the hero body line (SIP, Schemes, Jobs…). */
const HERO_TOPIC_LINKS = [
  { key: "heroKwSip", href: "/tools/sip-calculator" },
  { key: "heroKwSchemes", href: "/guides/schemes" },
  { key: "heroKwJobs", href: "/jobs" },
  { key: "heroKwHuid", href: "/huid-verification" },
  { key: "heroKwMoney", href: "/guides/money" },
  { key: "heroKwAi", href: "/ai" },
  { key: "heroKwMovies", href: "/cineverse" },
  { key: "heroKwGold", href: "/goldverse" },
] as const;

const HERO_MODULE_LINKS = [
  { key: "heroKwOcr", href: "/moneyverse/screenshot-scan" },
  { key: "heroKwMoneyVerse", href: "/moneyverse" },
  { key: "heroKwCineVerse", href: "/cineverse" },
  { key: "heroKwGoldVerse", href: "/goldverse" },
] as const;

function heroLinkClass(cinematic: boolean) {
  return cn(
    "font-semibold text-foreground/90 underline decoration-primary/35 underline-offset-[3px] transition-colors",
    "hover:text-primary hover:decoration-primary",
    cinematic && "dark:text-white/90 dark:decoration-orange-300/40 dark:hover:text-orange-200"
  );
}

function HeroBodyLinks({ cinematic }: { cinematic: boolean }) {
  const { t } = useDictionary();
  const linkClass = heroLinkClass(cinematic);

  return (
    <>
      {HERO_TOPIC_LINKS.map((item, i) => (
        <React.Fragment key={item.key}>
          {i > 0 ? ", " : null}
          <LocaleLink href={item.href} className={linkClass}>
            {t(`home.${item.key}`)}
          </LocaleLink>
        </React.Fragment>
      ))}
      {", "}
      <LocaleLink href="/tools" className={linkClass}>
        {t("home.heroKwTools")}
      </LocaleLink>
      {t("home.heroBodyAmp")}
      <LocaleLink href="/news" className={linkClass}>
        {t("home.heroKwNews")}
      </LocaleLink>
      {t("home.heroBodyMid")}
      {HERO_MODULE_LINKS.map((item, i) => (
        <React.Fragment key={item.key}>
          {i > 0 ? (i === HERO_MODULE_LINKS.length - 1 ? t("home.heroBodyAnd") : ", ") : null}
          <LocaleLink href={item.href} className={linkClass}>
            {t(`home.${item.key}`)}
          </LocaleLink>
        </React.Fragment>
      ))}
      {"."}
    </>
  );
}

interface Props {
  categories: CategoryWithCount[];
  /** Google Trends India keywords — shown under the search box */
  trendingKeywords?: HeroTrendKeyword[];
}

export function Hero({ categories, trendingKeywords = [] }: Props) {
  const reduce = useReducedMotion();
  const { t } = useDictionary();
  const cinematic = isHomeHeroVideoEnabled();
  const topics = categories.slice(0, 7);
  /** Same count as Live News home grid */
  const trendChips = trendingKeywords.slice(0, 8);
  const rotatingWords = [
    t("home.rotateRead"),
    t("home.rotateCreate"),
    t("home.rotateGrow"),
    t("home.rotateEarn"),
    t("home.rotateBuild"),
  ];

  const hubs = [
    { href: "/news", label: t("home.hubLiveNews"), live: true },
    { href: "/tools", label: t("home.hubTools") },
    { href: "/jobs", label: t("home.hubJobs") },
  ] as const;

  const modules = [
    { href: "/moneyverse/screenshot-scan", label: "OCR" },
    { href: "/ai", label: "AI" },
    { href: "/moneyverse", label: "MoneyVerse" },
    { href: "/cineverse", label: "CineVerse" },
    { href: "/goldverse", label: "GoldVerse" },
    { href: "/huid-verification", label: "HUID" },
  ] as const;

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto w-full max-w-[96rem] px-2 pt-7 pb-11 sm:px-3 md:pt-10 md:pb-14">
        {/* Ads sit at the outer corners; hero content stays centered */}
        <div className="flex w-full items-start">
          <div className="hidden w-[160px] shrink-0 justify-start pt-2 xl:flex 2xl:w-[180px]">
            <StickyRailAd
              slotKey="sidebar"
              sticky={false}
              label="Sponsored left"
            />
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easeOut }}
            className="mx-auto flex w-full min-w-0 max-w-[36rem] flex-1 flex-col items-center px-3 text-center sm:px-6"
          >
            {/* Advertise CTA — compact pill above the editorial eyebrow */}
            <motion.div
              className="mb-3 flex justify-center"
              initial={reduce ? false : { opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.02, duration: 0.45, ease: easeOut }}
            >
              <LocaleLink
                href="/advertise"
                className={cn(
                  "group relative inline-flex items-center gap-2 overflow-hidden rounded-full py-1 pl-1 pr-2.5",
                  "border border-transparent bg-card/80 shadow-[0_8px_28px_-14px_hsl(var(--primary)/0.5)] backdrop-blur-md",
                  "transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5",
                  "hover:shadow-[0_12px_32px_-12px_hsl(var(--saffron)/0.45)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
                  cinematic && "dark:bg-black/35 dark:shadow-[0_10px_32px_-12px_rgba(0,0,0,0.6)]"
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full p-px"
                  style={{
                    background:
                      "linear-gradient(120deg, hsl(var(--primary)), hsl(var(--saffron)), hsl(var(--primary)))",
                    backgroundSize: "200% 200%",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    animation: reduce ? undefined : "cv-ad-border-shift 3.2s linear infinite",
                  }}
                />
                {!reduce ? (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
                    animate={{ x: ["0%", "380%"] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.4 }}
                  />
                ) : null}

                <span className="relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center">
                  {!reduce ? (
                    <>
                      <motion.span
                        className="absolute inset-0 rounded-full bg-primary/25"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.35, repeat: Infinity, ease: "easeOut" }}
                      />
                      <motion.span
                        className="absolute inset-0 rounded-full border border-[hsl(var(--saffron))]/45"
                        animate={{ scale: [1, 1.75], opacity: [0.65, 0] }}
                        transition={{ duration: 1.35, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
                      />
                    </>
                  ) : null}
                  <motion.span
                    className={cn(
                      "relative flex h-7 w-7 items-center justify-center rounded-full",
                      "bg-gradient-to-br from-primary via-primary/85 to-[hsl(var(--saffron))]",
                      "shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.65)]"
                    )}
                    animate={
                      reduce
                        ? undefined
                        : {
                            rotate: [0, -12, 10, -6, 5, 0],
                            y: [0, -1.5, 0],
                            scale: [1, 1.05, 1],
                          }
                    }
                    transition={
                      reduce
                        ? undefined
                        : { duration: 1.3, repeat: Infinity, ease: "easeInOut" }
                    }
                    aria-hidden
                  >
                    <Megaphone className="h-3 w-3 text-white" strokeWidth={2.4} />
                  </motion.span>
                </span>

                  <span className="relative z-[1] flex flex-col items-start gap-0.5 text-left leading-none">
                  <span className="font-display text-[12px] font-bold tracking-tight text-gradient">
                    {t("home.advertise")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    <span className="h-0.5 w-0.5 rounded-full bg-[hsl(var(--saffron))]" />
                    {t("home.advertiseSub")}
                  </span>
                </span>

                <span
                  className={cn(
                    "relative z-[1] flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    "bg-muted/70 text-foreground transition-colors duration-300",
                    "group-hover:bg-primary group-hover:text-primary-foreground"
                  )}
                >
                  <ArrowUpRight
                    className={cn(
                      "h-3 w-3 transition-transform duration-300",
                      "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    )}
                  />
                </span>
              </LocaleLink>
            </motion.div>

            {/* Badge */}
            <motion.div
              className="flex justify-center"
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
            >
              <Badge
                variant="neon"
                className={cn(
                  "gap-1.5 border-border/80 bg-card/85 px-3.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground shadow-sm backdrop-blur-md",
                  cinematic && "dark:border-white/20 dark:bg-white/10 dark:text-white"
                )}
              >
                <motion.span
                  animate={reduce ? undefined : { rotate: [0, 12, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex shrink-0"
                >
                  <Sparkles className="h-3 w-3 text-accent" />
                </motion.span>
                {t("home.badge")}
              </Badge>
            </motion.div>

            {/* Brand */}
            <h1
              className={cn(
                "mt-4 font-display font-semibold tracking-[-0.03em] text-[clamp(2rem,4.6vw,3.1rem)] leading-[1.1]",
                cinematic && "dark:drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
              )}
            >
              <motion.span
                className="block text-balance text-gradient"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.55, ease: easeOut }}
              >
                ContentVerse India
              </motion.span>
            </h1>

            <motion.div
              className="mt-3 h-px w-10 origin-center bg-gradient-to-r from-transparent via-primary/55 to-transparent"
              initial={reduce ? false : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.45 }}
            />

            <motion.p
              className={cn(
                "mt-3 inline-flex max-w-full flex-wrap items-baseline justify-center gap-x-1.5 font-display text-[clamp(0.95rem,2vw,1.15rem)] font-medium leading-[1.45] tracking-[-0.012em]",
                "text-foreground/80",
                cinematic && "dark:text-white/85"
              )}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.5 }}
            >
              <TypewriterWord words={rotatingWords} reduce={reduce} />
              <span className="text-muted-foreground/85">
                {t("home.taglineRest")}
              </span>
            </motion.p>

            <motion.p
              className={cn(
                "mt-3 max-w-lg text-pretty text-[13px] leading-relaxed text-muted-foreground sm:text-sm",
                cinematic && "dark:text-white/65"
              )}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4 }}
            >
              <HeroBodyLinks cinematic={cinematic} />
            </motion.p>

            <motion.div
              className="mt-5 w-full"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.45 }}
            >
              <SiteVoiceSearch
                size="hero"
                searchPath="/search"
                className="mx-auto max-w-md"
                placeholder={t("home.searchPlaceholder")}
                inputClassName={cn(
                  cinematic &&
                    "dark:bg-white/10 dark:border-white/20 dark:text-white dark:placeholder:text-white/45"
                )}
              />
            </motion.div>

            {trendChips.length > 0 ? (
              <motion.div
                className="mt-3.5 flex w-full max-w-xl flex-wrap items-center justify-center gap-2"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                aria-label={t("home.trendSearchesTitle", "Trending searches")}
              >
                <span
                  className={cn(
                    "inline-flex h-7 shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                    cinematic && "dark:text-white/55"
                  )}
                >
                  <TrendingUp className="h-3.5 w-3.5 text-red-500" aria-hidden />
                  {t("home.trendSearchesTitleLead", "Trending")}
                </span>
                {trendChips.map((kw) => (
                  <LocaleLink
                    key={kw.href}
                    href={kw.href}
                    className={cn(
                      "inline-flex h-7 max-w-[12rem] items-center gap-1 truncate rounded-full border border-border/70 bg-card px-2.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors",
                      "hover:border-red-500/35 hover:bg-muted/60",
                      cinematic &&
                        "dark:border-white/15 dark:bg-white/10 dark:text-white/85 dark:hover:border-red-400/40 dark:hover:bg-white/15"
                    )}
                    title={kw.traffic ? `${kw.title} (~${kw.traffic})` : kw.title}
                  >
                    <TrendingUp className="h-3 w-3 shrink-0 text-red-500" aria-hidden />
                    <span className="truncate">{kw.title}</span>
                  </LocaleLink>
                ))}
              </motion.div>
            ) : null}

            <motion.div
              className="mt-5 flex items-center justify-center gap-2.5"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.4 }}
            >
              <motion.div whileHover={reduce ? undefined : { y: -1 }} whileTap={{ scale: 0.98 }}>
                <LocaleLink
                  href="/guides"
                  className={cn(
                    "group inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-colors",
                    "hover:bg-foreground/90 hover:shadow-[0_10px_28px_-14px_hsl(var(--foreground)/0.55)]",
                    cinematic && "dark:bg-white dark:text-black dark:hover:bg-white/90"
                  )}
                >
                  <BookOpen className="h-3.5 w-3.5 opacity-80" />
                  {t("home.ctaGuides")}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-55 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </LocaleLink>
              </motion.div>
              <motion.div whileHover={reduce ? undefined : { y: -1 }} whileTap={{ scale: 0.98 }}>
                <LocaleLink
                  href="/blogs"
                  className={cn(
                    "group inline-flex h-9 items-center gap-1 rounded-full border border-border bg-card/80 px-4 text-[13px] font-medium text-foreground/80 shadow-sm backdrop-blur-sm transition-colors",
                    "hover:border-foreground/20 hover:bg-card hover:text-foreground",
                    cinematic &&
                      "dark:border-white/20 dark:bg-white/5 dark:text-white/80 dark:hover:border-white/35 dark:hover:bg-white/10 dark:hover:text-white"
                  )}
                >
                  {t("home.ctaArticles")}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </LocaleLink>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-7 flex w-full flex-col items-center gap-3 border-t border-border/40 pt-5"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.52, duration: 0.4 }}
            >
              {topics.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {topics.map((cat) => (
                    <LocaleLink
                      key={cat.slug}
                      href={categoryPageHref(cat.slug)}
                      className={cn(
                        "inline-flex h-7 items-center rounded-full border border-border/50 bg-background/70 px-2.5 text-[11px] font-medium text-muted-foreground transition-all",
                        "hover:-translate-y-px hover:border-border hover:bg-card hover:text-foreground hover:shadow-sm",
                        cinematic &&
                          "dark:border-white/10 dark:bg-white/[0.04] dark:text-white/55 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
                      )}
                    >
                      {cat.name}
                    </LocaleLink>
                  ))}
                </div>
              ) : null}

              <p
                className={cn(
                  "flex flex-wrap items-center justify-center gap-x-2.5 text-[11px] text-muted-foreground/70",
                  cinematic && "dark:text-white/40"
                )}
              >
                {hubs.map((item, i) => (
                  <React.Fragment key={item.href}>
                    {i > 0 ? (
                      <span aria-hidden className="text-muted-foreground/30">
                        ·
                      </span>
                    ) : null}
                    <LocaleLink
                      href={item.href}
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                    >
                      {"live" in item && item.live ? (
                        <span className="relative flex h-1.5 w-1.5" aria-hidden>
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/60 opacity-75 motion-reduce:animate-none" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                        </span>
                      ) : null}
                      {item.label}
                    </LocaleLink>
                  </React.Fragment>
                ))}
              </p>

              {/* Product modules */}
              <p
                className={cn(
                  "flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground/65",
                  cinematic && "dark:text-white/40"
                )}
              >
                {modules.map((item, i) => (
                  <React.Fragment key={item.href}>
                    {i > 0 ? (
                      <span aria-hidden className="text-muted-foreground/25">
                        ·
                      </span>
                    ) : null}
                    <LocaleLink
                      href={item.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </LocaleLink>
                  </React.Fragment>
                ))}
              </p>
            </motion.div>
          </motion.div>

          <div className="hidden w-[160px] shrink-0 justify-end pt-2 xl:flex 2xl:w-[180px]">
            <StickyRailAd
              slotKey="hub"
              sticky={false}
              label="Sponsored right"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
