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
import { LatestSection } from "@/components/home/latest-section";
import { ContinueReadingStrip } from "@/components/home/continue-reading-strip";
import { EditorPick } from "@/components/home/editor-pick";
import { FeaturedCreators } from "@/components/home/featured-creators";
import { StayEngagedStrip } from "@/components/home/stay-engaged-strip";
import {
  JobsResultsSection,
  type JobsResultCard,
} from "@/components/home/jobs-results-section";
import { ReelsStripSection } from "@/components/reels/reels-strip-section";
import { getHomePageData } from "@/lib/data/home-data";
import { getSportsTeaserData } from "@/lib/sports/data";
import { getFinanceTickerDataCached } from "@/lib/finance/data";
import { getHomeModulePreviews } from "@/lib/home/module-previews";
import { getGovtJobsCached } from "@/lib/jobs/data";
import { getGoldPriceSnapshot } from "@/lib/goldverse/gold-price";
import { TOOL_REGISTRY, toolPath } from "@/lib/tools/registry";
import { GUIDE_SECTIONS, guideSectionPath } from "@/lib/guides/registry";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { Reveal, ScrollProgress } from "@/components/home/motion";
import { HomeEditorialSection } from "@/components/home/home-editorial-section";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { BandAd } from "@/components/ads/band-ad";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "ContentVerse India — original Indian guides, explainers and stories",
  description:
    "Original Indian guides, explainers and stories on money, schemes, jobs, and everyday how-tos — with free calculators as supporting tools.",
  path: "/",
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
});

/** Editorial-first order for AdSense / quality review. */
const HOME_SIDEBAR_SECTIONS = [
  { id: "home-top", label: "Home" },
  { id: "home-reels", label: "Reels" },
  { id: "home-guides", label: "Guides" },
  { id: "about-contentverse-heading", label: "About" },
  { id: "continue-reading", label: "Continue" },
  { id: "home-articles", label: "Articles" },
  { id: "editor-picks", label: "Picks" },
  { id: "home-latest", label: "Latest" },
  { id: "home-jobs", label: "Jobs" },
  { id: "home-sports", label: "Sports" },
  { id: "home-finance", label: "Finance" },
  { id: "home-money", label: "Money" },
  { id: "home-gold", label: "Gold" },
  { id: "home-tools", label: "Tools" },
  { id: "home-cine", label: "Cine" },
  { id: "explore-modules", label: "More" },
  { id: "featured-creators", label: "Creators" },
  { id: "stay-engaged", label: "Engage" },
  { id: "newsletter", label: "Newsletter" },
];

export default async function HomePage() {
  const [data, sportsTeaser, financeTicker, modulePreviews, jobs, results, gold] =
    await Promise.all([
      getHomePageData(),
      getSportsTeaserData(),
      getFinanceTickerDataCached().catch(() => null),
      getHomeModulePreviews(),
      getGovtJobsCached("jobs").catch(() => null),
      getGovtJobsCached("results").catch(() => null),
      getGoldPriceSnapshot().catch(() => null),
    ]);

  const jobCards: JobsResultCard[] = [];
  for (const job of jobs?.listings?.slice(0, 3) ?? []) {
    jobCards.push({
      title: job.title,
      href: job.link || "/jobs",
      meta: job.last_date ? `Last date · ${job.last_date}` : "Latest notification",
      kind: "job",
      kicker: "Sarkari",
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

  const toolItems = TOOL_REGISTRY.slice(0, 4).map((tool) => ({
    title: tool.shortTitle,
    href: toolPath(tool.slug),
    meta: tool.badge || "Supports guides",
  }));

  return (
    <>
      <SiteJsonLd />
      <ScrollProgress />
      <HomeStickySidebar sections={HOME_SIDEBAR_SECTIONS} />

      <div className="xl:[&_.container]:pl-16 2xl:[&_.container]:pl-20">
        <div id="home-top" className="scroll-mt-0">
          <HomeHeroShell>
            <Hero categories={data.categories} />
          </HomeHeroShell>
        </div>

        <div id="home-reels" className="scroll-mt-[calc(var(--site-header-offset)+1rem)]">
          <ReelsStripSection />
        </div>

        <Reveal>
          <HomeModuleSpotlight
            id="home-guides"
            eyebrow="India Guides"
            title={
              <>
                Original explainers for{" "}
                <span className="text-gradient">Indian readers</span>
              </>
            }
            description="Schemes, money, jobs, and how-tos — one strong page per topic, written for people who need clear steps."
            href="/guides"
            cta="Open Guides"
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

        <Reveal>
          <LatestSection blogs={data.latest} />
        </Reveal>

        <HubAdSense />

        <Reveal>
          <JobsResultsSection cards={jobsResultCards} />
        </Reveal>

        <SportsTeaser data={sportsTeaser} />

        <BandAd slotKey="horizontal" />

        <FinanceTeaser data={financeTicker} />

        <Reveal>
          <HomeModuleSpotlight
            id="home-money"
            eyebrow="Money Guides"
            title={
              <>
                SIP, tax, credit &{" "}
                <span className="text-gradient">everyday money</span>
              </>
            }
            description="Plain-language India money explainers. Calculators and trackers sit underneath the guides."
            href="/guides/money"
            cta="Open Money Guides"
            icon={Wallet}
            accentClassName="text-emerald-300"
            items={[
              {
                title: "SIP for beginners",
                href: "/guides/money/sip-calculator-india-beginners-guide",
                meta: "Systematic investing",
              },
              {
                title: "CIBIL / credit score",
                href: "/guides/money/credit-score-cibil-india-guide",
                meta: "What actually moves it",
              },
              {
                title: "Salary tax regimes",
                href: "/guides/money/salary-tax-calculator-india-guide",
                meta: "New vs old",
              },
              {
                title: "UPI fraud checklist",
                href: "/guides/schemes/upi-fraud-otp-scam-india",
                meta: "OTP scams & freeze steps",
              },
            ]}
          />
        </Reveal>

        <Reveal>
          <HomeModuleSpotlight
            id="home-gold"
            tint
            eyebrow="Gold & hallmark"
            title={
              <>
                Rates plus{" "}
                <span className="text-gradient">how to buy safely</span>
              </>
            }
            description="Live city rates with guides on HUID, hallmark, and invoices — not just a ticker."
            href="/goldverse"
            cta="Open GoldVerse"
            icon={Gem}
            accentClassName="text-amber-300"
            items={goldItems}
          />
        </Reveal>

        <Reveal>
          <HomeModuleSpotlight
            id="home-tools"
            eyebrow="Supporting tools"
            title={
              <>
                Calculators that{" "}
                <span className="text-gradient">back the guides</span>
              </>
            }
            description="EMI, IFSC, tax estimates and more — utilities for readers who finished an explainer."
            href="/tools"
            cta="Open Tools"
            icon={Wrench}
            accentClassName="text-teal-300"
            items={toolItems}
          />
        </Reveal>

        <Reveal>
          <HomeModuleSpotlight
            id="home-cine"
            tint
            eyebrow="CineVerse"
            title={
              <>
                Movies, OTT &{" "}
                <span className="text-gradient">watch guides</span>
              </>
            }
            description="Where to watch and what to know — paired with our movie guides."
            href="/cineverse"
            cta="Open CineVerse"
            icon={Clapperboard}
            accentClassName="text-indigo-300"
            items={[
              { title: "OTT India guide", href: "/guides/movies/where-to-watch-ott-india", meta: "Where to watch" },
              { title: "Browse movies", href: "/cineverse", meta: "Search by title" },
              { title: "Watchlist", href: "/cineverse", meta: "Save for later" },
              { title: "Movie checklist", href: "/guides/movies/movie-release-cast-watch-checklist", meta: "Release & cast" },
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
