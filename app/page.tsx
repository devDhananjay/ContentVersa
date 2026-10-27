import type { Metadata } from "next";
import {
  BookOpen,
  Clapperboard,
  Gem,
  Wallet,
  Wrench,
} from "lucide-react";
import { HomeHeroShell } from "@/components/home/home-hero-shell";
import { Hero } from "@/components/home/hero";
import { HomeStickySidebar } from "@/components/home/home-sticky-sidebar";
import { HomeModuleSpotlight } from "@/components/home/home-module-spotlight";
import { PlatformModulesStrip } from "@/components/home/platform-modules-strip";
import { Newsletter } from "@/components/home/newsletter";
import { SportsTeaser } from "@/components/home/sports-teaser";
import { FinanceTeaser } from "@/components/home/finance-teaser";
import { TrendingSection } from "@/components/home/trending";
import { ContinueReadingStrip } from "@/components/home/continue-reading-strip";
import { EditorPick } from "@/components/home/editor-pick";
import { FeaturedCreators } from "@/components/home/featured-creators";
import { StayEngagedStrip } from "@/components/home/stay-engaged-strip";
import {
  JobsResultsSection,
  type JobsResultCard,
} from "@/components/home/jobs-results-section";
import { ReelsStripSection } from "@/components/reels/reels-strip-section";
import { LiveNewsSection } from "@/components/home/live-news-section";
import { LiveNewsReturnScroll } from "@/components/home/live-news-return-scroll";
import { TrendingSearchesSection } from "@/components/home/trending-searches-section";
import { getHomePageData } from "@/lib/data/home-data";
import { getLiveNewsForHome } from "@/lib/data/live-news";
import { fetchIndiaTrends } from "@/lib/trending/google-trends";
import { getSportsTeaserData } from "@/lib/sports/data";
import { getFinanceTickerDataCached } from "@/lib/finance/data";
import { getHomeModulePreviews } from "@/lib/home/module-previews";
import { getGovtJobsCached } from "@/lib/jobs/data";
import { getGoldPriceSnapshot } from "@/lib/goldverse/gold-price";
import { getHomeFeaturedTools, toolPath } from "@/lib/tools/registry";
import { GUIDE_SECTIONS, guideSectionPath } from "@/lib/guides/registry";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { Reveal, ScrollProgress } from "@/components/home/motion";
import { HomeEditorialSection } from "@/components/home/home-editorial-section";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { BandAd } from "@/components/ads/band-ad";
import { buildMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { withLocalePrefix } from "@/lib/i18n/config";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title:
      locale === "hi"
        ? "ContentVerse India — भारतीय गाइड्स, समझाने वाले लेख और कहानियाँ"
        : "ContentVerse India — original Indian guides, explainers and stories",
    description:
      locale === "hi"
        ? "पैसे, योजनाएँ, नौकरियाँ और रोज़मर्रा के कैसे-करें — मूल भारतीय गाइड्स और मुफ़्त कैलकुलेटर्स।"
        : "Original Indian guides, explainers and stories on money, schemes, jobs, and everyday how-tos — with free calculators as supporting tools.",
    path: withLocalePrefix("/", locale),
    keywords: [
      "ContentVerse India",
      "contentverse.co.in",
      "Indian guides",
      "SIP calculator India",
      "CIBIL credit score India",
      "HUID verification",
      "government schemes India",
      "free India tools",
    ],
    alternates: buildHreflangAlternates("/"),
  });
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  const homeSidebarSections = [
    { id: "home-top", label: t(dict, "home.sidebarHome") },
    { id: "home-reels", label: t(dict, "home.sidebarReels") },
    { id: "home-live-news", label: t(dict, "home.sidebarLiveNews") },
    { id: "home-guides", label: t(dict, "home.sidebarGuides") },
    { id: "about-contentverse-heading", label: t(dict, "home.sidebarAbout") },
    { id: "continue-reading", label: t(dict, "home.sidebarContinue") },
    { id: "home-articles", label: t(dict, "home.sidebarArticles") },
    { id: "editor-picks", label: t(dict, "home.sidebarPicks") },
    { id: "home-jobs", label: t(dict, "home.sidebarJobs") },
    { id: "home-sports", label: t(dict, "home.sidebarSports") },
    { id: "home-trending-searches", label: t(dict, "home.sidebarTrending") },
    { id: "home-finance", label: t(dict, "home.sidebarFinance") },
    { id: "home-money", label: t(dict, "home.sidebarMoney") },
    { id: "home-gold", label: t(dict, "home.sidebarGold") },
    { id: "home-tools", label: t(dict, "home.sidebarTools") },
    { id: "home-cine", label: t(dict, "home.sidebarCine") },
    { id: "explore-modules", label: t(dict, "home.sidebarMore") },
    { id: "featured-creators", label: t(dict, "home.sidebarCreators") },
    { id: "stay-engaged", label: t(dict, "home.sidebarEngage") },
    { id: "newsletter", label: t(dict, "home.sidebarNewsletter") },
  ];

  const [
    data,
    sportsTeaser,
    financeTicker,
    modulePreviews,
    jobs,
    results,
    gold,
    liveNews,
    trendingSearches,
  ] = await Promise.all([
      getHomePageData(),
      getSportsTeaserData(),
      getFinanceTickerDataCached().catch(() => null),
      getHomeModulePreviews(),
      getGovtJobsCached("jobs").catch(() => null),
      getGovtJobsCached("results").catch(() => null),
      getGoldPriceSnapshot().catch(() => null),
      getLiveNewsForHome(8).catch(() => []),
      fetchIndiaTrends().catch(() => []),
    ]);

  const jobCards: JobsResultCard[] = [];
  for (const job of jobs?.listings?.slice(0, 3) ?? []) {
    jobCards.push({
      title: job.title,
      href: job.link || "/jobs",
      meta: job.last_date ? `Last date · ${job.last_date}` : t(dict, "home.jobsMetaLatest"),
      kind: "job",
      kicker: t(dict, "home.jobsHubSarkari"),
    });
  }
  for (const row of results?.listings?.slice(0, 2) ?? []) {
    jobCards.push({
      title: row.title,
      href: row.link || "/results",
      meta: row.last_date ? `Updated · ${row.last_date}` : "Official result",
      kind: "result",
      kicker: "Results",
    });
  }
  const hubCards: JobsResultCard[] = [
    {
      title: "Browse all Sarkari job notifications",
      href: "/jobs",
      meta: "Central & state openings",
      kind: "hub",
      kicker: "Jobs hub",
    },
    {
      title: "Exam results & scorecards",
      href: "/results",
      meta: "Official portals only",
      kind: "result",
      kicker: "Results hub",
    },
    {
      title: "Admit cards & hall tickets",
      href: "/jobs?category=admit-cards",
      meta: "Download before the exam",
      kind: "admit",
      kicker: "Admit cards",
    },
    {
      title: "How to read a Sarkari notification",
      href: "/guides/jobs",
      meta: "Eligibility, fees, last date",
      kind: "guide",
      kicker: "Jobs guide",
    },
  ];
  // Prefer live listings; always keep hub cards so the grid never looks empty.
  const jobsResultCards = [...jobCards, ...hubCards].slice(0, 6);

  const goldCity =
    gold?.rates?.find((row) => /delhi/i.test(row.city)) || gold?.rates?.[0];
  const goldItems = goldCity
    ? [
        {
          title: `${goldCity.city} 22K`,
          href: "/goldverse",
          meta: `₹${goldCity.gold22k.toLocaleString("en-IN")} / 10g`,
        },
        {
          title: `${goldCity.city} 24K`,
          href: "/goldverse",
          meta: `₹${goldCity.gold24k.toLocaleString("en-IN")} / 10g`,
        },
        {
          title: "HUID buying guide",
          href: "/guides/money/huid-hallmark-gold-buying-india",
          meta: "Hallmark checklist",
        },
        {
          title: "City rates",
          href: "/goldverse",
          meta: "Live prices",
        },
      ]
    : [
        { title: "Live gold rates", href: "/goldverse", meta: "City-wise 22K / 24K" },
        {
          title: "HUID buying guide",
          href: "/guides/money/huid-hallmark-gold-buying-india",
          meta: "Hallmark checklist",
        },
        { title: "Gold loan vs personal", href: "/guides/money/gold-loan-vs-personal-loan-india", meta: "When each fits" },
        { title: "Money guides", href: "/guides/money", meta: "SIP, tax, EMI" },
      ];

  const toolItems = getHomeFeaturedTools(4).map((tool) => ({
    title: tool.shortTitle,
    href: toolPath(tool.slug),
    meta: tool.badge || "Free India tool",
  }));

  return (
    <>
      <SiteJsonLd />
      <ScrollProgress />
      <HomeStickySidebar sections={homeSidebarSections} />

      {/* Hero + its own L/R rails — centered, no page-wide shift */}
      <div id="home-top" className="scroll-mt-0">
        <HomeHeroShell>
          <Hero
            categories={data.categories}
            trendingKeywords={trendingSearches.slice(0, 6).map((t) => ({
              title: t.title,
              href: t.href,
              traffic: t.traffic || undefined,
            }))}
          />
        </HomeHeroShell>
      </div>

      <div className="xl:[&_.container]:pl-16 2xl:[&_.container]:pl-20">
        <div id="home-reels" className="scroll-mt-[calc(var(--site-header-offset)+1rem)]">
          <ReelsStripSection />
        </div>

        <LiveNewsReturnScroll />
        <LiveNewsSection items={liveNews} />

        <Reveal>
          <HomeModuleSpotlight
            id="home-guides"
            eyebrow={t(dict, "home.spotlightGuidesEyebrow")}
            title={
              <>
                {t(dict, "home.spotlightGuidesTitleBefore")}{" "}
                <span className="text-gradient">{t(dict, "home.spotlightGuidesTitleAccent")}</span>
              </>
            }
            description={t(dict, "home.spotlightGuidesDesc")}
            href="/guides"
            cta={t(dict, "home.spotlightGuidesCta")}
            icon={BookOpen}
            accentClassName="text-violet-300"
            items={GUIDE_SECTIONS.slice(0, 4).map((s) => ({
              kicker: s.shortTitle,
              title: s.cardTitle,
              href: guideSectionPath(s.slug),
              meta: s.cardSubtext,
            }))}
          />
        </Reveal>

        {/* Wide strip — long ads like before */}
        <BandAd slotKey="horizontal" />

        <HomeEditorialSection />

        <ContinueReadingStrip />

        <div id="home-articles" className="scroll-mt-24">
          <TrendingSection blogs={data.trending} />
        </div>

        <Reveal>
          <EditorPick
            blogs={
              data.editorPicks.length > 0
                ? data.editorPicks.slice(0, 3)
                : data.featured.length > 0
                  ? data.featured.slice(0, 3)
                  : data.latest.slice(0, 3)
            }
          />
        </Reveal>

        <BandAd slotKey="hub" />

        <HubAdSense />

        <Reveal>
          <JobsResultsSection cards={jobsResultCards} />
        </Reveal>

        <SportsTeaser data={sportsTeaser} />

        <TrendingSearchesSection items={trendingSearches} />

        <BandAd slotKey="horizontal" />

        <FinanceTeaser data={financeTicker} />

        <Reveal>
          <HomeModuleSpotlight
            id="home-money"
            eyebrow={t(dict, "home.spotlightMoneyEyebrow")}
            title={
              <>
                {t(dict, "home.spotlightMoneyTitleBefore")}{" "}
                <span className="text-gradient">{t(dict, "home.spotlightMoneyTitleAccent")}</span>
              </>
            }
            description={t(dict, "home.spotlightMoneyDesc")}
            href="/guides/money"
            cta={t(dict, "home.spotlightMoneyCta")}
            icon={Wallet}
            accentClassName="text-emerald-300"
            items={[
              {
                title: t(dict, "home.spotlightMoneyItem1"),
                href: "/guides/money/sip-calculator-india-beginners-guide",
                meta: t(dict, "home.spotlightMoneyMeta1"),
              },
              {
                title: t(dict, "home.spotlightMoneyItem2"),
                href: "/guides/money/credit-score-cibil-india-guide",
                meta: t(dict, "home.spotlightMoneyMeta2"),
              },
              {
                title: t(dict, "home.spotlightMoneyItem3"),
                href: "/guides/money/salary-tax-calculator-india-guide",
                meta: t(dict, "home.spotlightMoneyMeta3"),
              },
              {
                title: t(dict, "home.spotlightMoneyItem4"),
                href: "/guides/schemes/upi-fraud-otp-scam-india",
                meta: t(dict, "home.spotlightMoneyMeta4"),
              },
            ]}
          />
        </Reveal>

        <Reveal>
          <HomeModuleSpotlight
            id="home-gold"
            tint
            eyebrow={t(dict, "home.spotlightGoldEyebrow")}
            title={
              <>
                {t(dict, "home.spotlightGoldTitleBefore")}{" "}
                <span className="text-gradient">{t(dict, "home.spotlightGoldTitleAccent")}</span>
              </>
            }
            description={t(dict, "home.spotlightGoldDesc")}
            href="/goldverse"
            cta={t(dict, "home.spotlightGoldCta")}
            icon={Gem}
            accentClassName="text-amber-300"
            items={goldItems}
          />
        </Reveal>

        <Reveal>
          <HomeModuleSpotlight
            id="home-tools"
            eyebrow={t(dict, "home.spotlightToolsEyebrow")}
            title={
              <>
                {t(dict, "home.spotlightToolsTitleBefore")}{" "}
                <span className="text-gradient">{t(dict, "home.spotlightToolsTitleAccent")}</span>
              </>
            }
            description={t(dict, "home.spotlightToolsDesc")}
            href="/tools"
            cta={t(dict, "home.spotlightToolsCta")}
            icon={Wrench}
            accentClassName="text-teal-300"
            items={toolItems}
          />
        </Reveal>

        <Reveal>
          <HomeModuleSpotlight
            id="home-cine"
            tint
            eyebrow={t(dict, "home.spotlightCineEyebrow")}
            title={
              <>
                {t(dict, "home.spotlightCineTitleBefore")}{" "}
                <span className="text-gradient">{t(dict, "home.spotlightCineTitleAccent")}</span>
              </>
            }
            description={t(dict, "home.spotlightCineDesc")}
            href="/cineverse"
            cta={t(dict, "home.spotlightCineCta")}
            icon={Clapperboard}
            accentClassName="text-indigo-300"
            items={[
              {
                title: t(dict, "home.spotlightCineItem1"),
                href: "/guides/movies/where-to-watch-ott-india",
                meta: t(dict, "home.spotlightCineMeta1"),
              },
              {
                title: t(dict, "home.spotlightCineItem2"),
                href: "/cineverse",
                meta: t(dict, "home.spotlightCineMeta2"),
              },
              {
                title: t(dict, "home.spotlightCineItem3"),
                href: "/cineverse",
                meta: t(dict, "home.spotlightCineMeta3"),
              },
              {
                title: t(dict, "home.spotlightCineItem4"),
                href: "/guides/movies/movie-release-cast-watch-checklist",
                meta: t(dict, "home.spotlightCineMeta4"),
              },
            ]}
          />
        </Reveal>

        <PlatformModulesStrip previews={modulePreviews} />

        <Reveal>
          <FeaturedCreators creators={data.creators} />
        </Reveal>

        <StayEngagedStrip />

        <BandAd slotKey="horizontal" />

        <Newsletter />
      </div>
    </>
  );
}
