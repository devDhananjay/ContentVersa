import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { GovtCategoryTabs } from "@/components/jobs/govt-category-tabs";
import { GovtJobCard } from "@/components/jobs/govt-job-card";
import { JobsSectionHeader } from "@/components/jobs/jobs-section-header";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { GOVT_CATEGORIES } from "@/lib/jobs/constants";
import { getGovtJobsCached, parseGovtCategory } from "@/lib/jobs/data";
import { buildMetadata } from "@/lib/seo";
import { GOVT_JOBS_SEO, hubSeoJsonLdBlocks } from "@/lib/seo/hub-seo";
import { SHOW_THIRD_PARTY_CREDITS } from "@/lib/site/third-party-credits";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { withLocalePrefix } from "@/lib/i18n/config";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ cat?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { cat } = await searchParams;
  const category = parseGovtCategory(cat);
  const meta = GOVT_CATEGORIES.find((item) => item.id === category);

  return buildMetadata({
    title: `Government ${meta?.label ?? "Jobs"} — Sarkari Naukri India`,
    description:
      meta?.description ??
      "Latest government job notifications, sarkari results and exam updates India.",
    path: withLocalePrefix("/jobs/govt", locale),
    alternates: buildHreflangAlternates("/jobs/govt"),
    keywords: [
      "sarkari naukri",
      "government jobs India",
      "govt job notification",
      "SSC jobs",
      "UPSC vacancy",
      "railway recruitment",
      "bank jobs India",
      "state PSC jobs",
      "admit card",
      "sarkari result jobs",
      meta?.label,
    ].filter(Boolean) as string[],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600",
  });
}

export default async function GovtJobsPage({ searchParams }: PageProps) {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const { cat } = await searchParams;
  const category = parseGovtCategory(cat);
  const data = await getGovtJobsCached(category);
  const meta = GOVT_CATEGORIES.find((item) => item.id === category)!;
  const showDate = category === "jobs";

  return (
    <div className="space-y-6">
      <HubJsonLd blocks={hubSeoJsonLdBlocks(GOVT_JOBS_SEO)} />
      <HubEditorialIntro title={t(dict, "hubs.jobsGovtEditorialTitle")}>
        <p>{t(dict, "hubs.jobsGovtEditorialBody")}</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Confirm post name, vacancy count, age limit and last date (IST).</li>
          <li>Match education and category certificates to the exact notification wording.</li>
          <li>
            Read our{" "}
            <Link href="/guides/jobs/how-to-read-sarkari-job-notification" className="text-primary hover:underline">
              notification guide
            </Link>{" "}
            and{" "}
            <Link href="/guides/jobs/ssc-style-exam-notification-checklist" className="text-primary hover:underline">
              SSC-style checklist
            </Link>{" "}
            before peak deadline nights.
          </li>
        </ol>
      </HubEditorialIntro>

      {data.error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p className="text-muted-foreground">{data.error}</p>
        </div>
      )}

      <JobsSectionHeader
        eyebrow={SHOW_THIRD_PARTY_CREDITS ? "Sarkari Result" : "Sarkari"}
        title={meta.label}
        highlight="Updates"
        description={meta.description}
      />

      <GovtCategoryTabs active={category} />

      <p className="text-sm text-muted-foreground">
        {data.source === "portals" ? (
          <>
            <span className="font-medium text-foreground">{data.count}</span> official portals · Apply
            only on commission websites
          </>
        ) : data.count > 0 ? (
          <>
            <span className="font-medium text-foreground">{data.count}</span> listings
            {data.source === "cache" ? " (last saved)" : ""} · Opens official pages in a new tab
          </>
        ) : (
          "Listings refresh every 30 minutes"
        )}
      </p>

      {data.listings.length > 0 ? (
        <div className="grid gap-3">
          {data.listings.map((item) => (
            <GovtJobCard key={item.link} item={item} showDate={showDate && data.source === "live"} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            No {meta.label.toLowerCase()} in the live feed right now. Try another category, or open
            an official portal from our{" "}
            <Link href="/guides/jobs" className="text-primary hover:underline">
              jobs guides
            </Link>
            .
          </p>
        </div>
      )}

      <HubAdSense />
    </div>
  );
}
