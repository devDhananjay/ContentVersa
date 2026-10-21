import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Newspaper, Sparkles, Wrench } from "lucide-react";
import { PageBack } from "@/components/site/page-back";
import { SiteVoiceSearch } from "@/components/search/site-voice-search";
import { searchSite, type SiteSearchHit } from "@/lib/search/site-search";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Search ContentVerse India",
  description:
    "Search articles, India guides, free tools, HUID, SIP, CIBIL and Live News on ContentVerse India.",
  path: "/search",
  keywords: ["ContentVerse search", "HUID", "SIP calculator", "India guides"],
  // Search SERPs should not compete with hubs / guides in Google.
  noIndex: true,
});

function HitCard({ hit }: { hit: SiteSearchHit }) {
  return (
    <Link
      href={hit.href}
      className={cn(
        "group block rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--v2-shadow-sm)]",
        "transition-[border-color,box-shadow] hover:border-primary/35 hover:shadow-[var(--v2-shadow-md)]"
      )}
    >
      {hit.badge ? (
        <span className="mb-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {hit.badge}
        </span>
      ) : null}
      <h3 className="font-display text-base font-bold leading-snug group-hover:text-primary">
        {hit.title}
      </h3>
      {hit.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {hit.description}
        </p>
      ) : null}
      <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        Open
        <ArrowRight className="h-3 w-3" />
      </p>
    </Link>
  );
}

function Section({
  title,
  icon,
  hits,
}: {
  title: string;
  icon: ReactNode;
  hits: SiteSearchHit[];
}) {
  if (!hits.length) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
        {icon}
        {title}
        <span className="text-sm font-normal text-muted-foreground">
          ({hits.length})
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {hits.map((h) => (
          <HitCard key={`${h.type}-${h.href}`} hit={h} />
        ))}
      </div>
    </section>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const result = q ? await searchSite(q) : null;

  return (
    <div className="container pt-8 pb-12 md:pt-10">
      <PageBack href="/" label="Home" className="mb-6" />
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        Search
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Find articles, India guides, free tools, Live News hubs — try HUID, SIP,
        CIBIL, or a headline.
      </p>

      <div className="mt-6 max-w-2xl">
        <SiteVoiceSearch
          size="bar"
          searchPath="/search"
          placeholder="Search HUID, SIP, CIBIL, news…"
          initialQuery={q}
          navigateOnSubmit
          navigateOnVoice
        />
      </div>

      {!q ? (
        <p className="mt-10 text-sm text-muted-foreground">
          Type a keyword or tap the mic to search the whole site.
        </p>
      ) : result && result.total === 0 ? (
        <div className="mt-10 rounded-3xl border bg-card p-12 text-center">
          <p className="font-display text-2xl font-bold">No matches yet</p>
          <p className="mt-2 text-muted-foreground">
            Nothing matched “{q}”. Try another word, or browse{" "}
            <Link href="/guides" className="text-primary underline">
              Guides
            </Link>{" "}
            and{" "}
            <Link href="/tools" className="text-primary underline">
              Tools
            </Link>
            .
          </p>
        </div>
      ) : result ? (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            {result.total} result{result.total === 1 ? "" : "s"} for “{result.query}”
          </p>
          <Section
            title="Guides"
            icon={<BookOpen className="h-4 w-4 text-primary" />}
            hits={result.guides}
          />
          <Section
            title="Tools & hubs"
            icon={<Wrench className="h-4 w-4 text-primary" />}
            hits={[...result.tools, ...result.hubs]}
          />
          <Section
            title="Articles & news"
            icon={<Newspaper className="h-4 w-4 text-primary" />}
            hits={result.blogs}
          />
          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/blogs?q=${encodeURIComponent(q)}`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Browse articles only
            </Link>
            <Link href="/news" className="text-muted-foreground hover:underline">
              Live News desk
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
