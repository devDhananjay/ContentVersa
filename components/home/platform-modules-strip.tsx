import Link from "next/link";
import { Medal, TrendingUp, Briefcase, Film, Compass } from "lucide-react";
import { SITE_NAV_HUBS } from "@/lib/seo";

const ICONS = {
  Sports: Medal,
  Finance: TrendingUp,
  Jobs: Briefcase,
  Reels: Film,
  Blogs: Compass,
} as const;

/** Crawlable hub links — helps Google pick sitelinks (Sports, Finance, Jobs, Reels). */
export function PlatformModulesStrip() {
  return (
    <section
      className="border-y border-border/50 bg-muted/20"
      aria-labelledby="platform-modules-heading"
    >
      <div className="container py-8 md:py-10">
        <header className="mb-6">
          <h2
            id="platform-modules-heading"
            className="font-display text-xl md:text-2xl font-bold tracking-tight"
          >
            Explore ContentVerse
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Jump straight into blogs, live sports, Indian markets, jobs and creator reels — all on
            one platform.
          </p>
        </header>
        <nav aria-label="Main platform modules">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {SITE_NAV_HUBS.map((hub) => {
              const Icon = ICONS[hub.name as keyof typeof ICONS] ?? Compass;
              return (
                <li key={hub.path}>
                  <Link
                    href={hub.path}
                    className="group flex flex-col h-full rounded-2xl border bg-card/80 p-4 hover:border-neon-purple/40 hover:bg-card transition-colors"
                  >
                    <Icon className="h-5 w-5 text-neon-purple mb-2" aria-hidden />
                    <span className="font-semibold text-sm group-hover:text-neon-purple transition-colors">
                      {hub.name}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {hub.description}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}
