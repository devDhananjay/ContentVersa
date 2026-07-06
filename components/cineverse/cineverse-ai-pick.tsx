import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

const PICKS = [
  { mood: "Bollywood weekend", href: "/blogs?category=movies" },
  { mood: "OTT binge", href: "/blogs?category=movies" },
  { mood: "South Indian hits", href: "/blogs?category=movies" },
];

export function CineverseAiPick() {
  return (
    <section className="overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-500/15 via-card to-card p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
            <Sparkles className="h-3.5 w-3.5" />
            AI companion
          </p>
          <h2 className="mt-2 font-display text-xl font-bold md:text-2xl">
            What should I watch?
          </h2>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Read curated movie & OTT explainers from Indian creators — or explore
            trending titles below and save your picks to your watchlist.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PICKS.map((p) => (
            <Link
              key={p.mood}
              href={p.href}
              className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
            >
              {p.mood}
            </Link>
          ))}
          <Link
            href="/blogs?category=movies"
            className="inline-flex items-center gap-1 rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-600"
          >
            Explore picks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
