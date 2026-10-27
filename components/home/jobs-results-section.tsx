"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  ScrollText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/i18n/use-dictionary";

export type JobsResultCard = {
  title: string;
  href: string;
  meta: string;
  kind: "job" | "result" | "admit" | "guide" | "hub";
  /** Optional short organisation / board line */
  kicker?: string;
};

const KIND_LABEL_KEY: Record<JobsResultCard["kind"], string> = {
  job: "home.jobsKindJob",
  result: "home.jobsKindResult",
  admit: "home.jobsKindAdmit",
  guide: "home.jobsKindGuide",
  hub: "home.jobsKindPortal",
};

const KIND_META: Record<
  JobsResultCard["kind"],
  { icon: typeof Briefcase; badgeClass: string }
> = {
  job: {
    icon: Briefcase,
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  result: {
    icon: ClipboardList,
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  admit: {
    icon: FileCheck2,
    badgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  guide: {
    icon: GraduationCap,
    badgeClass: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  hub: {
    icon: ScrollText,
    badgeClass: "border-primary/30 bg-primary/10 text-primary",
  },
};

interface Props {
  cards: JobsResultCard[];
}

/** Home Jobs & Results — colourful discovery cards (listing + portals + guides). */
export function JobsResultsSection({ cards }: Props) {
  const reduce = useReducedMotion();
  const { t } = useDictionary();
  if (!cards.length) return null;

  const [featured, ...rest] = cards;
  const grid = rest.slice(0, 5);

  return (
    <section
      id="home-jobs"
      className="scroll-mt-[calc(var(--site-header-offset)+1rem)] border-y border-border/60 bg-muted/40"
    >
      <div className="container py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="v2-eyebrow inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {t("home.jobsEyebrow")}
            </p>
            <h2 className="mt-1.5 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {t("home.jobsTitleBefore")}{" "}
              <span className="text-gradient">{t("home.jobsTitleAccent")}</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
              {t("home.jobsDesc")}
            </p>
          </div>
          <Link href="/jobs" className="hidden sm:block">
            <Button variant="outline" className="gap-2 rounded-full">
              {t("home.jobsOpenJobs")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured ? (
            <JobCard
              card={featured}
              featured
              index={0}
              reduce={reduce}
              kindLabel={t(KIND_LABEL_KEY[featured.kind])}
              featuredNote={t("home.jobsFeaturedNote")}
              className="md:col-span-2 lg:col-span-1 lg:row-span-2"
            />
          ) : null}
          {grid.map((card, i) => (
            <JobCard
              key={`${card.href}-${card.title}`}
              card={card}
              index={i + 1}
              reduce={reduce}
              kindLabel={t(KIND_LABEL_KEY[card.kind])}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 sm:hidden">
          <Link href="/jobs" className="flex-1">
            <Button variant="gradient" className="w-full gap-2">
              {t("home.jobsOpenJobs")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/results" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              {t("home.jobsOpenResults")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function JobCard({
  card,
  featured,
  index,
  reduce,
  kindLabel,
  featuredNote,
  className,
}: {
  card: JobsResultCard;
  featured?: boolean;
  index: number;
  reduce: boolean | null;
  kindLabel: string;
  featuredNote?: string;
  className?: string;
}) {
  const kind = KIND_META[card.kind];
  const Icon = kind.icon;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={cn(className)}
    >
      <Link
        href={card.href}
        className={cn(
          "v2-raised v2-lift group relative flex h-full flex-col overflow-hidden p-5",
          featured && "min-h-[16rem] justify-between p-6 md:min-h-[18rem]"
        )}
      >
        <div className="v2-aurora pointer-events-none opacity-50" aria-hidden />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("gap-1 border font-semibold", kind.badgeClass)}
            >
              <Icon className="h-3 w-3" />
              {kindLabel}
            </Badge>
            {card.kicker ? (
              <span className="truncate text-[11px] font-medium text-muted-foreground">
                {card.kicker}
              </span>
            ) : null}
          </div>
          <h3
            className={cn(
              "font-display font-semibold leading-snug tracking-tight group-hover:text-primary",
              featured ? "text-2xl md:text-3xl" : "text-lg line-clamp-3"
            )}
          >
            {card.title}
          </h3>
          {featured && featuredNote ? (
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {featuredNote}
            </p>
          ) : null}
        </div>
        <div className="relative mt-5 flex items-end justify-between gap-2">
          <p className="text-xs text-muted-foreground">{card.meta}</p>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
        </div>
      </Link>
    </motion.div>
  );
}
