import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MONEY_TOPICS, moneyTopicPath } from "@/lib/finance/money-topics";

export function MoneyTopicsGrid({
  title = "MoneyVerse guides",
  subtitle = "Gold, silver, SIP, mutual funds, stocks, IPO, FD, RD, loans, cards, credit score & tax",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section id="money-guides" className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MONEY_TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={moneyTopicPath(topic.slug)}
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
              Open guide
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
