import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Newspaper, Sparkles, Wrench } from "lucide-react";
import { PageBack } from "@/components/site/page-back";
import { SiteVoiceSearch } from "@/components/search/site-voice-search";
import { LocaleLink } from "@/components/i18n/locale-link";
import { searchSite, type SiteSearchHit } from "@/lib/search/site-search";
import { buildMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";
import { withLocalePrefix } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  return buildMetadata({
    title: `${t(dict, "hubs.searchTitle")} | ContentVerse India`,
    description: t(dict, "hubs.searchSub"),
    path: withLocalePrefix("/search", locale),
    keywords: ["ContentVerse search", "HUID", "SIP calculator", "India guides"],
    alternates: buildHreflangAlternates("/search"),
    noIndex: true,
  });
}

function HitCard({ hit, openLabel }: { hit: SiteSearchHit; openLabel: string }) {
  return (
    <LocaleLink
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
        {openLabel}
        <ArrowRight className="h-3 w-3" />
      </p>
    </LocaleLink>
  );
}

function Section({
  title,
  icon,
  hits,
  openLabel,
}: {
  title: string;
  icon: ReactNode;
  hits: SiteSearchHit[];
  openLabel: string;
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
          <HitCard key={`${h.type}-${h.href}`} hit={h} openLabel={openLabel} />
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
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const result = q ? await searchSite(q) : null;
  const openLabel = t(dict, "common.open");

  return (
    <div className="container pt-8 pb-12 md:pt-10">
      <PageBack href="/" label={t(dict, "common.home")} className="mb-6" />
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        {t(dict, "hubs.searchTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        {t(dict, "hubs.searchSub")}
      </p>

      <div className="mt-6 max-w-2xl">
        <SiteVoiceSearch
          size="bar"
          searchPath="/search"
          placeholder={t(dict, "hubs.searchPlaceholder")}
          initialQuery={q}
          navigateOnSubmit
          navigateOnVoice
        />
      </div>

      {!q ? (
        <p className="mt-10 text-sm text-muted-foreground">
          {t(dict, "hubs.searchPlaceholder")}
        </p>
      ) : result && result.total === 0 ? (
        <div className="mt-10 rounded-3xl border bg-card p-12 text-center">
          <p className="font-display text-2xl font-bold">
            {t(dict, "common.emptySearch")}
          </p>
          <p className="mt-2 text-muted-foreground">
            {t(dict, "hubs.searchEmpty")}{" "}
            <LocaleLink href="/guides" className="text-primary underline">
              {t(dict, "nav.indiaGuides")}
            </LocaleLink>{" "}
            ·{" "}
            <LocaleLink href="/tools" className="text-primary underline">
              {t(dict, "nav.indiaTools")}
            </LocaleLink>
          </p>
        </div>
      ) : result ? (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            {result.total} · “{result.query}”
          </p>
          <Section
            title={t(dict, "hubs.searchSectionGuides")}
            icon={<BookOpen className="h-4 w-4 text-primary" />}
            hits={result.guides}
            openLabel={openLabel}
          />
          <Section
            title={t(dict, "hubs.searchSectionTools")}
            icon={<Wrench className="h-4 w-4 text-primary" />}
            hits={[...result.tools, ...result.hubs]}
            openLabel={openLabel}
          />
          <Section
            title={t(dict, "hubs.searchSectionArticles")}
            icon={<Newspaper className="h-4 w-4 text-primary" />}
            hits={result.blogs}
            openLabel={openLabel}
          />
          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            <LocaleLink
              href={`/blogs?q=${encodeURIComponent(q)}`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t(dict, "hubs.searchBrowseArticles")}
            </LocaleLink>
            <LocaleLink href="/news" className="text-muted-foreground hover:underline">
              {t(dict, "news.openDesk")}
            </LocaleLink>
          </div>
        </>
      ) : null}
    </div>
  );
}
