"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { CategoryWithCount } from "@/lib/data/home-data";
import { categoryPageHref } from "@/lib/data/categories";
import { isHomeHeroVideoEnabled } from "@/lib/site/home-hero-video";
import { AnimatedGrid, FloatingOrbs } from "@/components/home/motion";
import { cn } from "@/lib/utils";

const ROTATING_WORDS = ["Read.", "Create.", "Grow.", "Earn.", "Build."];
const easeOut = [0.22, 1, 0.36, 1] as const;

/** Typewriter + blink caret for the rotating hero word. */
function TypewriterWord({ words, reduce }: { words: string[]; reduce: boolean | null }) {
  const [wordIndex, setWordIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const [phase, setPhase] = React.useState<"typing" | "pause" | "deleting">("typing");

  React.useEffect(() => {
    if (reduce) {
      setText(words[0] ?? "");
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
    <span className="text-gradient inline-flex items-baseline relative align-bottom min-h-[1.05em]">
      <span className="inline-block whitespace-nowrap">{display}</span>
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
  );
}

interface Props {
  categories: CategoryWithCount[];
  stats: { creators: string; readers: string; paid: string };
}

export function Hero({ categories, stats }: Props) {
  const reduce = useReducedMotion();
  const cinematic = isHomeHeroVideoEnabled();

  const quickCategories = categories.slice(0, 8);
  const visibleStats = [
    { value: stats.creators, label: "Published creators" },
    { value: stats.readers, label: "Article reads" },
    { value: stats.paid, label: "Paid to creators" },
  ].filter((stat) => stat.value !== "—");

  return (
    <section className="relative overflow-hidden">
      {!cinematic ? (
        <>
          <FloatingOrbs />
          <AnimatedGrid />
        </>
      ) : null}

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
                "mb-6 py-1.5 px-4 text-xs gap-1.5",
                cinematic
                  ? "border-white/20 bg-white/10 text-white shadow-[0_0_24px_-6px_rgba(255,255,255,0.25)]"
                  : "border-neon-cyan/30 bg-neon-cyan/10 shadow-[0_0_24px_-6px] shadow-neon-cyan/40"
              )}
            >
              <motion.span
                animate={reduce ? undefined : { rotate: [0, 12, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex"
              >
                <Sparkles className="h-3 w-3" />
              </motion.span>
              India&apos;s home for long-form creators · AI Assist live
            </Badge>
          </motion.div>

          <h1
            className={cn(
              "font-display font-extrabold tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] max-w-5xl",
              cinematic && "drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
            )}
          >
            <motion.span
              className="block"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: easeOut }}
            >
              The home for{" "}
              <TypewriterWord words={ROTATING_WORDS} reduce={reduce} />
            </motion.span>
            <motion.span
              className={cn("block text-foreground mt-1", cinematic && "text-white")}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.7, ease: easeOut }}
            >
              creators of the new internet.
            </motion.span>
          </h1>

          <motion.p
            className={cn(
              "mt-6 text-lg md:text-xl max-w-2xl leading-relaxed",
              cinematic ? "text-white/75" : "text-muted-foreground"
            )}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Publish long-form stories, grow a real audience, and earn in ₹ — with
            human moderation, AI assist, and tools built for Indian creators.
          </motion.p>

          <motion.form
            action="/blogs"
            className="mt-10 w-full max-w-2xl relative group"
            initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.55 }}
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-neon-blue/40 via-neon-purple/40 to-neon-pink/40 opacity-0 blur-lg transition-opacity duration-500 group-focus-within:opacity-70" />
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search ‘AI agents’, ‘growth loops’, ‘TypeScript’…"
                className={cn(
                  "h-16 pl-14 pr-32 text-base rounded-2xl shadow-glow backdrop-blur focus-visible:ring-neon-purple/40",
                  cinematic
                    ? "bg-white/10 border-white/20 text-white placeholder:text-white/45"
                    : "bg-card/90 border-border/80"
                )}
              />
              <Button
                variant="gradient"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 rounded-xl shadow-lg shadow-neon-purple/20"
              >
                Search
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.form>

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
                    "text-xs rounded-full border px-3 py-1.5 transition-colors backdrop-blur",
                    cinematic
                      ? "border-white/20 text-white/80 hover:border-white/40 hover:bg-white/10 hover:text-white"
                      : "border-border/60 hover:border-neon-purple/60 hover:bg-neon-purple/5 hover:text-foreground text-muted-foreground"
                  )}
                >
                  #{cat.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-12 flex flex-col sm:flex-row items-center gap-4"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.55 }}
          >
            <motion.div whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link href="/dashboard/create">
                <Button
                  variant="gradient"
                  size="xl"
                  className="gap-2 shadow-xl shadow-neon-purple/25"
                >
                  <Sparkles className="h-5 w-5" />
                  Start Writing
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link href="/blogs">
                <Button
                  variant="outline"
                  size="xl"
                  className={cn(
                    "gap-2 backdrop-blur",
                    cinematic ? "border-white/25 bg-white/10 text-white hover:bg-white/15" : "bg-card/40"
                  )}
                >
                  <TrendingUp className="h-5 w-5" />
                  Explore Articles
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {visibleStats.length > 0 ? (
            <motion.div
              className="mt-16 grid grid-cols-3 gap-8 md:gap-16"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12, delayChildren: 0.85 } },
              }}
            >
              {visibleStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <div className="font-display font-extrabold text-2xl md:text-4xl text-gradient">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </motion.div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent",
          cinematic ? "from-background via-background/80" : "from-background"
        )}
      />
    </section>
  );
}
