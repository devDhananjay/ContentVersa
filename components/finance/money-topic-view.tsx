import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import type { MoneyTopic } from "@/lib/finance/money-topics";
import {
  getMoneyTopic,
  moneyTopicBreadcrumbJsonLd,
  moneyTopicFaqJsonLd,
  moneyTopicPath,
  moneyTopicWebPageJsonLd,
} from "@/lib/finance/money-topics";

export function MoneyTopicJsonLd({ topic }: { topic: MoneyTopic }) {
  const blocks = [
    moneyTopicWebPageJsonLd(topic),
    moneyTopicFaqJsonLd(topic),
    moneyTopicBreadcrumbJsonLd(topic),
  ];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}

export function MoneyTopicView({ topic }: { topic: MoneyTopic }) {
  const related = topic.relatedSlugs
    .map((slug) => getMoneyTopic(slug))
    .filter((t): t is MoneyTopic => Boolean(t));

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <MoneyTopicJsonLd topic={topic} />

      <header className="space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
          <Wallet className="h-3.5 w-3.5" />
          MoneyVerse · {topic.eyebrow}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {topic.h1}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          {topic.description}
        </p>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
        {topic.paragraphs.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>

      <ul className="space-y-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-sm">
        {topic.bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Tools & next steps
        </h2>
        <div className="flex flex-wrap gap-2">
          {topic.toolLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-100 transition-colors hover:border-emerald-400/50 hover:bg-emerald-500/20"
            >
              {link.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      </section>

      {topic.faqs.length ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {topic.faqs.map((f) => (
              <div
                key={f.question}
                className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3"
              >
                <h3 className="text-sm font-semibold">{f.question}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="space-y-3 border-t border-border/40 pt-6">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Related MoneyVerse topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={moneyTopicPath(r.slug)}
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-emerald-500/40 hover:text-foreground"
              >
                {r.shortTitle}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-[11px] text-muted-foreground">
        Educational content only — not investment, tax, or credit advice. Verify rates and
        rules with banks, SEBI-registered advisors, or official government sources.
      </p>
    </article>
  );
}
