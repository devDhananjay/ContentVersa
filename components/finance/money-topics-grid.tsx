"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MONEY_TOPICS, moneyTopicPath } from "@/lib/finance/money-topics";
import { resolvedPublicHref } from "@/lib/seo/content-redirects";
import { useDictionary } from "@/components/i18n/use-dictionary";

export function MoneyTopicsGrid({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const { t } = useDictionary();
  const resolvedTitle = title ?? t("hubs.financeMoneyGuidesTitle");
  const resolvedSubtitle = subtitle ?? t("hubs.financeMoneyGuidesSub");

  return (
    <section id="money-guides" className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
          {resolvedTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{resolvedSubtitle}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MONEY_TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={resolvedPublicHref(moneyTopicPath(topic.slug))}
            className="group rounded-2xl border border-border/50 bg-muted/15 p-4 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/5"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/90">
              {topic.eyebrow}
            </p>
            <h3 className="mt-1.5 font-display text-base font-semibold tracking-tight group-hover:text-emerald-100">
              {topic.shortTitle}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {topic.description}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
              {t("hubs.openGuide")}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
