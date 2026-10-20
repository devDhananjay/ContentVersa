"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteVoiceSearch } from "@/components/search/site-voice-search";
import type { CategoryWithCount } from "@/lib/data/home-data";
import { categoryPageHref } from "@/lib/data/categories";
import { isHomeHeroVideoEnabled } from "@/lib/site/home-hero-video";
import { cn } from "@/lib/utils";

const ROTATING_WORDS = ["Read", "Create", "Grow", "Earn", "Build"];
/** Longest word locks typewriter width so partial text never shifts the line. */
const LONGEST_ROTATING_WORD = ROTATING_WORDS.reduce((a, b) =>
  a.length >= b.length ? a : b
);
const easeOut = [0.22, 1, 0.36, 1] as const;

/** Typewriter + blink caret — reserved width prevents layout flicker. */
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
    <span className="text-gradient relative inline-grid align-bottom text-left">
      <span
        className="invisible col-start-1 row-start-1 whitespace-nowrap"
        aria-hidden
      >
        {LONGEST_ROTATING_WORD}
      </span>
      <span className="col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap min-h-[1.05em]">
        <span className="inline-block">{display}</span>
        <motion.span
          aria-hidden
          className="ml-0.5 inline-block w-[0.08em] min-w-[3px] h-[0.85em] translate-y-[0.08em] rounded-sm bg-gradient-to-b from-neon-blue via-neon-purple to-neon-pink shadow-[0_0_12px_2px] shadow-neon-purple/50"
          animate={reduce ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
          transition={
            reduce
              ? undefined
              : { duration: 1, repeat: Infinity, times: [0, 0.45, 0.55, 1], ease: "linear" }
          }
        />
      </span>
    </span>
  );
}

interface Props {
  categories: CategoryWithCount[];
}

export function Hero({ categories }: Props) {
  const reduce = useReducedMotion();
  const cinematic = isHomeHeroVideoEnabled();

  const quickCategories = categories.slice(0, 8);

  return (
    <section className="relative overflow-hidden">
      <div className="container relative pt-8 md:pt-16 pb-20 md:pb-28">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Badge
              variant="neon"
              className={cn(
                "mb-6 gap-1.5 border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur",
                cinematic && "dark:border-white/20 dark:bg-white/10 dark:text-white"
              )}
            >
              <motion.span
                animate={reduce ? undefined : { rotate: [0, 12, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex"
              >
                <Sparkles className="h-3 w-3 text-accent" />
              </motion.span>
              India&apos;s original guides, explainers and stories
            </Badge>
          </motion.div>

          <h1
            className={cn(
              "font-display font-bold tracking-[-0.02em] text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.04] max-w-5xl",
              cinematic && "dark:text-white dark:drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
            )}
          >
            <motion.span
              className="block"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: easeOut }}
            >
              ContentVerse India
            </motion.span>
            <motion.span
              className={cn(
                "mt-3 flex flex-col items-center justify-center gap-y-1 text-[0.5em] sm:text-[0.45em] md:text-[0.4em] font-semibold leading-[1.25] min-h-[1.35em] lg:flex-row lg:flex-wrap lg:gap-x-[0.35em]",
                "text-foreground/90",
                cinematic && "dark:text-white/90"
              )}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.7, ease: easeOut }}
            >
              <TypewriterWord words={ROTATING_WORDS} reduce={reduce} />
              <span className="text-left">
                — original Indian guides, explainers and stories.
              </span>
            </motion.span>
          </h1>

          <motion.p
            className={cn(
              "mt-6 text-lg md:text-xl max-w-2xl leading-relaxed text-muted-foreground",
              cinematic && "dark:text-white/75"
            )}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Publish useful India explainers — SIP, schemes, jobs, HUID — with human
            review. Free calculators and live scores sit underneath, not in front.
          </motion.p>

          <motion.div
            className="mt-10 w-full max-w-2xl"
            initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.55 }}
          >
            <SiteVoiceSearch
              size="hero"
              searchPath="/blogs"
              placeholder="Search ‘SIP’, ‘CIBIL’, ‘HUID’… or tap the mic"
              inputClassName={cn(
                cinematic &&
                  "dark:bg-white/10 dark:border-white/20 dark:text-white dark:placeholder:text-white/45"
              )}
            />
          </motion.div>

          <motion.div
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05, delayChildren: 0.55 } },
            }}
          >
            <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2">
              Trending now
            </span>
            {quickCategories.map((cat) => (
              <motion.div
                key={cat.slug}
                variants={{
                  hidden: { opacity: 0, y: 10, scale: 0.9 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={reduce ? undefined : { y: -3, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <Link
                  href={categoryPageHref(cat.slug)}
                  className={cn(
                    "v2-chip backdrop-blur",
                    cinematic &&
                      "dark:border-white/20 dark:bg-transparent dark:text-white/80 dark:hover:border-white/40 dark:hover:bg-white/10 dark:hover:text-white"
                  )}
                >
                  #{cat.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.55 }}
          >
            <motion.div whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link href="/guides">
                <Button
                  variant="gradient"
                  size="xl"
                  className="h-12 w-full gap-2 sm:h-14 sm:w-auto"
                >
                  <BookOpen className="h-5 w-5" />
                  Read India Guides
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link href="/blogs">
                <Button
                  variant="outline"
                  size="xl"
                  className={cn(
                    "h-12 w-full gap-2 backdrop-blur sm:h-14 sm:w-auto",
                    cinematic &&
                      "dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:hover:text-white"
                  )}
                >
                  Browse articles
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent",
          "from-background",
          cinematic && "dark:via-background/80"
        )}
      />
    </section>
  );
}
