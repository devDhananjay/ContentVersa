"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Flame, Search, TrendingUp } from "lucide-react";
import { LocaleLink } from "@/components/i18n/locale-link";
import { useDictionary } from "@/components/i18n/use-dictionary";
import { TrendThumb } from "@/components/trending/trend-thumb";
import { shortTrendBlurb, type TrendItem } from "@/lib/trending/google-trends";
import { cn } from "@/lib/utils";

function TrendCard({
  trend,
  rank,
  index,
  reduce,
  searchesLabel,
  openLabel,
  badgeLabel,
}: {
  trend: TrendItem;
  rank: number;
  index: number;
  reduce: boolean | null;
  searchesLabel: string;
  openLabel: string;
  badgeLabel: string;
}) {
  const blurb = shortTrendBlurb(trend);

  return (
    <motion.div
      className="h-full"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.04 }}
    >
      <LocaleLink
        href={trend.href}
        className={cn(
          "group relative flex h-full min-h-[176px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/90 shadow-[var(--v2-shadow-sm)]",
          "transition-[border-color,box-shadow,transform] duration-300",
          "hover:border-orange-500/40 hover:shadow-[var(--v2-shadow-md)]",
          "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-orange-500/0 before:via-orange-500/70 before:to-orange-500/0"
        )}
      >
        <div className="relative">
          <TrendThumb
            src={trend.picture}
            alt=""
            className="aspect-[16/9] w-full"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-orange-200 backdrop-blur">
            {rank}
          </span>
          {trend.traffic ? (
            <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-orange-100 backdrop-blur">
              <TrendingUp className="h-3 w-3" />
              ~{trend.traffic} {searchesLabel}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-3.5">
          <span className="mb-1.5 inline-flex w-fit items-center gap-1 rounded-full border border-orange-500/25 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <Flame className="h-3 w-3" />
            {badgeLabel}
          </span>
          <h3 className="font-display text-[0.95rem] font-bold leading-snug tracking-tight transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400 md:text-base">
            {trend.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
            {blurb}
          </p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs font-medium">
            <span className="text-muted-foreground">{openLabel}</span>
            <ArrowRight className="h-3.5 w-3.5 text-orange-500/80 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </LocaleLink>
    </motion.div>
  );
}

interface Props {
  items: TrendItem[];
}

/** Home Google Trends India — search spikes, styled like Live News. */
export function TrendingSearchesSection({ items }: Props) {
  const reduce = useReducedMotion();
  const { t } = useDictionary();
  if (!items.length) return null;

  const chips = items.slice(0, 12);
  const cards = items.slice(0, 8);

  return (
    <section
      id="home-trending-searches"
      className="scroll-mt-[calc(var(--site-header-offset)+1rem)] border-b border-border/50 bg-gradient-to-b from-orange-500/[0.05] via-transparent to-transparent"
      aria-label={t("home.trendSearchesTitle", "Trending searches")}
    >
      <div className="container py-10 md:py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="v2-eyebrow mb-2 inline-flex items-center gap-1.5 text-orange-600/90 dark:text-orange-400/90">
              <Search className="h-3.5 w-3.5" />
              {t("home.trendSearchesEyebrow", "Most searched in India")}
            </p>
            <h2 className="font-display flex flex-nowrap items-center gap-2.5 text-3xl font-bold tracking-tight md:text-4xl">
              <span
                className={cn(
                  "relative inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500",
                  !reduce && "animate-pulse"
                )}
                aria-hidden
              />
              <span className="whitespace-nowrap">
                <span className="text-orange-600 dark:text-orange-400">
                  {t("home.trendSearchesTitleLead", "Trending")}
                </span>{" "}
                <span className="text-foreground">
                  {t("home.trendSearchesTitleRest", "searches")}
                </span>
              </span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
              {t(
                "home.trendSearchesIntro",
                "What India is searching right now — open a topic for a short briefing and related headlines."
              )}
            </p>
          </div>
          <LocaleLink
            href="/trending"
            className="hidden shrink-0 sm:inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("home.trendSearchesAll", "All trending")}{" "}
            <ArrowRight className="h-4 w-4" />
          </LocaleLink>
        </div>

        {/* Quick chip row — “TRENDING · Box Office · Tiger Shroff …” */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-red-500" aria-hidden />
            {t("home.trendSearchesTitleLead", "Trending")}
          </span>
          {chips.map((trend) => (
            <LocaleLink
              key={`chip-${trend.slug}`}
              href={trend.href}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium transition hover:border-red-500/35 hover:bg-muted/60"
            >
              <TrendingUp className="h-3 w-3 shrink-0 text-red-500" aria-hidden />
              {trend.title}
              {trend.traffic ? (
                <span className="text-[10px] font-normal text-muted-foreground">
                  ~{trend.traffic}
                </span>
              ) : null}
            </LocaleLink>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((trend, i) => (
            <TrendCard
              key={trend.slug}
              trend={trend}
              rank={i + 1}
              index={i}
              reduce={reduce}
              searchesLabel={t("home.trendSearchesUnit", "searches")}
              openLabel={t("home.trendSearchesOpen", "Open briefing")}
              badgeLabel={t("home.trendSearchesTitleLead", "Trending")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
