"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StickyRailAd } from "@/components/ads/sticky-rail-ad";
import { SiteVoiceSearch } from "@/components/search/site-voice-search";
import type { CategoryWithCount } from "@/lib/data/home-data";
import { categoryPageHref } from "@/lib/data/categories";
import { isHomeHeroVideoEnabled } from "@/lib/site/home-hero-video";
import { cn } from "@/lib/utils";

const ROTATING_WORDS = ["Read", "Create", "Grow", "Earn", "Build"];
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

interface Props {
  categories: CategoryWithCount[];
}

export function Hero({ categories }: Props) {
  const reduce = useReducedMotion();
  const cinematic = isHomeHeroVideoEnabled();
  const topics = categories.slice(0, 7);

  const hubs = [
    { href: "/news", label: "Live News", live: true },
    { href: "/tools", label: "Tools" },
    { href: "/jobs", label: "Jobs" },
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
      <div className="relative mx-auto w-full max-w-[96rem] px-2 pt-10 pb-14 sm:px-3 md:pt-14 md:pb-20">
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
                India&apos;s original guides, explainers and stories
              </Badge>
            </motion.div>

            {/* Brand */}
            <h1
              className={cn(
                "mt-5 font-display font-semibold tracking-[-0.03em] text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.1]",
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
              className="mt-3.5 h-px w-10 origin-center bg-gradient-to-r from-transparent via-primary/55 to-transparent"
              initial={reduce ? false : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.45 }}
            />

            <motion.p
              className={cn(
                "mt-3.5 inline-flex max-w-full flex-wrap items-baseline justify-center gap-x-1.5 font-display text-[clamp(0.98rem,2.1vw,1.2rem)] font-medium leading-[1.45] tracking-[-0.012em]",
                "text-foreground/80",
                cinematic && "dark:text-white/85"
              )}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.5 }}
            >
              <TypewriterWord words={ROTATING_WORDS} reduce={reduce} />
              <span className="text-muted-foreground/85">
                Original Indian Guides &amp; Stories
              </span>
            </motion.p>

            <motion.p
              className={cn(
                "mt-3 max-w-md text-pretty text-[13px] leading-relaxed text-muted-foreground sm:text-sm",
                cinematic && "dark:text-white/65"
              )}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4 }}
            >
              SIP, Schemes, Jobs, HUID, Money, AI, Movies, Gold, Tools &amp; News —
              Clear Explainers With Human Review. Plus OCR, MoneyVerse, CineVerse
              And GoldVerse.
            </motion.p>

            <motion.div
              className="mt-7 w-full"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.45 }}
            >
              <SiteVoiceSearch
                size="hero"
                searchPath="/search"
                className="mx-auto max-w-md"
                placeholder="SIP, CIBIL, HUID… or Speak"
                inputClassName={cn(
                  cinematic &&
                    "dark:bg-white/10 dark:border-white/20 dark:text-white dark:placeholder:text-white/45"
                )}
              />
            </motion.div>

            <motion.div
              className="mt-5 flex items-center justify-center gap-2"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.4 }}
            >
              <motion.div whileHover={reduce ? undefined : { y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/guides"
                  className={cn(
                    "group inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-colors",
                    "hover:bg-foreground/90 hover:shadow-[0_10px_28px_-14px_hsl(var(--foreground)/0.55)]",
                    cinematic && "dark:bg-white dark:text-black dark:hover:bg-white/90"
                  )}
                >
                  <BookOpen className="h-3.5 w-3.5 opacity-80" />
                  India Guides
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-55 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
              <motion.div whileHover={reduce ? undefined : { y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/blogs"
                  className={cn(
                    "group inline-flex h-9 items-center gap-1 rounded-full border border-border bg-card/80 px-4 text-[13px] font-medium text-foreground/80 shadow-sm backdrop-blur-sm transition-colors",
                    "hover:border-foreground/20 hover:bg-card hover:text-foreground",
                    cinematic &&
                      "dark:border-white/20 dark:bg-white/5 dark:text-white/80 dark:hover:border-white/35 dark:hover:bg-white/10 dark:hover:text-white"
                  )}
                >
                  Articles
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-8 flex w-full flex-col items-center gap-3.5 border-t border-border/40 pt-6"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.52, duration: 0.4 }}
            >
              {topics.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {topics.map((cat) => (
                    <Link
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
                    </Link>
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
                    <Link
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
                    </Link>
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
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
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
