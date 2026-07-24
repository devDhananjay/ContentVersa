import type { Metadata } from "next";
import {
  Briefcase,
  Clapperboard,
  Gem,
  Wallet,
  Wrench,
} from "lucide-react";
import { HomeHeroShell } from "@/components/home/home-hero-shell";
import { Hero } from "@/components/home/hero";
import { HomeModulesRail } from "@/components/home/home-modules-rail";
import { HomeStickySidebar } from "@/components/home/home-sticky-sidebar";
import { HomeModuleSpotlight } from "@/components/home/home-module-spotlight";
import { PlatformModulesStrip } from "@/components/home/platform-modules-strip";
import { ReelsStripSection } from "@/components/reels/reels-strip-section";
import { Newsletter } from "@/components/home/newsletter";
import { SportsTeaser } from "@/components/home/sports-teaser";
import { FinanceTeaser } from "@/components/home/finance-teaser";
import { TrendingSection } from "@/components/home/trending";
import { LatestSection } from "@/components/home/latest-section";
import { ContinueReadingStrip } from "@/components/home/continue-reading-strip";
import { getHomePageData } from "@/lib/data/home-data";
import { getSportsTeaserData } from "@/lib/sports/data";
import { getFinanceTickerDataCached } from "@/lib/finance/data";
import { getHomeModulePreviews } from "@/lib/home/module-previews";
import { getGovtJobsCached } from "@/lib/jobs/data";
import { getGoldPriceSnapshot } from "@/lib/goldverse/gold-price";
import { TOOL_REGISTRY, toolPath } from "@/lib/tools/registry";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { Reveal } from "@/components/home/motion";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "ContentVerse India — Blogs, Sports, Finance, Jobs & Reels",
  description:
    "India's creator platform. Read blogs, watch reels, follow live cricket scores, track Nifty & Sensex, and find government & private jobs — all at contentverse.co.in.",
  path: "/",
  keywords: [
    "ContentVerse India",
    "contentverse.co.in",
    "Indian blogs",
    "sports scores India",
    "Nifty Sensex live",
    "sarkari jobs",
    "creator reels India",
  ],
});

const HOME_SIDEBAR_SECTIONS = [
  { id: "home-top", label: "Home" },
  { id: "continue-reading", label: "Continue" },
  { id: "explore-modules", label: "Modules" },
  { id: "home-sports", label: "Sports" },
  { id: "home-finance", label: "Finance" },
  { id: "home-money", label: "Money" },
  { id: "home-gold", label: "Gold" },
  { id: "home-tools", label: "Tools" },
  { id: "home-jobs", label: "Jobs" },
  { id: "home-cine", label: "Cine" },
  { id: "home-articles", label: "Articles" },
  { id: "home-latest", label: "Latest" },
  { id: "newsletter", label: "Newsletter" },
];

export default async function HomePage() {
  const [data, sportsTeaser, financeTicker, modulePreviews, jobs, gold] =
    await Promise.all([
      getHomePageData(),
      getSportsTeaserData(),
      getFinanceTickerDataCached().catch(() => null),
      getHomeModulePreviews(),
      getGovtJobsCached("jobs").catch(() => null),
      getGoldPriceSnapshot().catch(() => null),
    ]);

  const jobItems =
    jobs?.listings?.slice(0, 4).map((job) => ({
      title: job.title,
      href: job.link || "/jobs",
      meta: job.last_date ? `Last date · ${job.last_date}` : "Government update",
    })) ?? [
      { title: "Sarkari jobs", href: "/jobs", meta: "Latest notifications" },
      { title: "Results", href: "/jobs?category=results", meta: "Exam results" },
      { title: "Admit cards", href: "/jobs?category=admit-cards", meta: "Download hall tickets" },
      { title: "Private roles", href: "/jobs", meta: "Curated openings" },
    ];

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
          title: "HUID Check",
          href: "/huid-verification",
          meta: "Verify BIS hallmark",
        },
        {
          title: "City rates",
          href: "/goldverse",
          meta: "316+ cities",
        },
      ]
    : [
        { title: "Live gold rates", href: "/goldverse", meta: "City-wise 22K / 24K" },
        { title: "HUID Check", href: "/huid-verification", meta: "Verify BIS hallmark" },
        { title: "Hallmark guide", href: "/goldverse", meta: "Buy smarter jewellery" },
        { title: "Jeweller tools", href: "/goldverse", meta: "For shops & buyers" },
      ];

  const toolItems = TOOL_REGISTRY.slice(0, 4).map((tool) => ({
    title: tool.shortTitle,
    href: toolPath(tool.slug),
    meta: tool.badge || "Free tool",
  }));

  return (
    <>
      <SiteJsonLd />
      <HomeStickySidebar sections={HOME_SIDEBAR_SECTIONS} />

      <div className="xl:[&_.container]:pl-16 2xl:[&_.container]:pl-20">
      <div id="home-top" className="scroll-mt-0">
        <HomeHeroShell>
          <ReelsStripSection />
          <HomeModulesRail />
          <Hero stats={data.stats} categories={data.categories} />
        </HomeHeroShell>
      </div>

      <ContinueReadingStrip />

      <PlatformModulesStrip previews={modulePreviews} />

      <Reveal>
        <SportsTeaser data={sportsTeaser} />
      </Reveal>
      <Reveal delay={0.04}>
        <FinanceTeaser data={financeTicker} />
      </Reveal>

      <Reveal>
        <HomeModuleSpotlight
          id="home-money"
          eyebrow="MoneyVerse"
          title={
            <>
              Expenses, OCR & <span className="text-gradient">bank statements</span>
            </>
          }
          description="Track UPI spends, scan payment screenshots, and analyse bank PDFs."
          href="/moneyverse"
          cta="Open MoneyVerse"
          icon={Wallet}
          accentClassName="text-emerald-300"
          items={[
            {
              title: "Expense tracker",
              href: "/moneyverse",
              meta: "Budgets & SIP reminders",
            },
            {
              title: "Screenshot Scan",
              href: "/moneyverse/screenshot-scan",
              meta: "UPI → auto expense",
            },
            {
              title: "Bank Statement",
              href: "/moneyverse/bank-statement-analyzer",
              meta: "PDF → transactions",
            },
            {
              title: "Privacy-first",
              href: "/moneyverse",
              meta: "Statements are not stored",
            },
          ]}
        />
      </Reveal>

      <Reveal>
        <HomeModuleSpotlight
          id="home-gold"
          eyebrow="GoldVerse"
          title={
            <>
              Gold rates & <span className="text-gradient">HUID</span>
            </>
          }
          description="City gold prices and hallmark verification in one place."
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
          eyebrow="India Tools"
          title={
            <>
              {TOOL_REGISTRY.length} free <span className="text-gradient">utilities</span>
            </>
          }
          description="IFSC, weather, EMI, nearby places and more — no signup needed to browse."
          href="/tools"
          cta="Open Tools"
          icon={Wrench}
          accentClassName="text-teal-300"
          items={toolItems}
        />
      </Reveal>

      <Reveal>
        <HomeModuleSpotlight
          id="home-jobs"
          eyebrow="Jobs Hub"
          title={
            <>
              Sarkari & private <span className="text-gradient">careers</span>
            </>
          }
          description="Government notifications and curated private openings."
          href="/jobs"
          cta="Open Jobs"
          icon={Briefcase}
          accentClassName="text-amber-400"
          items={jobItems}
        />
      </Reveal>

      <Reveal>
        <HomeModuleSpotlight
          id="home-cine"
          eyebrow="CineVerse"
          title={
            <>
              Movies, OTT & <span className="text-gradient">watchlists</span>
            </>
          }
          description="Discover films, save what to watch next, and get smart picks."
          href="/cineverse"
          cta="Open CineVerse"
          icon={Clapperboard}
          accentClassName="text-indigo-300"
          items={[
            { title: "Browse movies", href: "/cineverse", meta: "TMDB-powered search" },
            { title: "Watchlist", href: "/cineverse", meta: "Save for later" },
            { title: "AI picks", href: "/cineverse", meta: "What to watch tonight" },
            { title: "OTT India", href: "/cineverse", meta: "Popular across platforms" },
          ]}
        />
      </Reveal>

      <TrendingSection blogs={data.trending} />
      <Reveal>
        <LatestSection blogs={data.latest} />
      </Reveal>
      <Newsletter />
      </div>
    </>
  );
}
