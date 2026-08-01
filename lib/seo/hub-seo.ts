import { SITE } from "@/lib/seo";

export type HubFaq = { question: string; answer: string };

export type HubSeoConfig = {
  path: string;
  name: string;
  description: string;
  faqs: HubFaq[];
  /** schema.org @type for the page entity */
  pageType?: "CollectionPage" | "WebPage" | "WebApplication";
};

export function hubBreadcrumbJsonLd(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: `${SITE.url}${path}`,
      },
    ],
  };
}

export function hubFaqJsonLd(faqs: HubFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function hubCollectionJsonLd(input: {
  name: string;
  description: string;
  path: string;
  pageType?: "CollectionPage" | "WebPage" | "WebApplication";
  applicationCategory?: string;
}) {
  const pageType = input.pageType ?? "CollectionPage";
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": pageType,
    name: input.name,
    description: input.description,
    url: `${SITE.url}${input.path}`,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
  if (pageType === "WebApplication") {
    base.applicationCategory = input.applicationCategory ?? "UtilitiesApplication";
    base.operatingSystem = "Web";
    base.offers = { "@type": "Offer", price: "0", priceCurrency: "INR" };
  }
  return base;
}

/** Returns [Collection/WebPage, FAQPage, BreadcrumbList] for a hub. */
export function hubSeoJsonLdBlocks(config: HubSeoConfig) {
  return [
    hubCollectionJsonLd({
      name: config.name,
      description: config.description,
      path: config.path,
      pageType: config.pageType,
    }),
    hubFaqJsonLd(config.faqs),
    hubBreadcrumbJsonLd(config.name, config.path),
  ];
}

export const FINANCE_HUB_SEO: HubSeoConfig = {
  path: "/finance",
  name: "Finance — Nifty, Sensex & MoneyVerse India",
  description:
    "Live Nifty 50 & Sensex plus MoneyVerse guides for gold, silver, SIP, mutual funds, stocks, IPO, FD, RD, loans, credit cards, credit score and tax India.",
  faqs: [
    {
      question: "Does ContentVerse India Finance give stock tips?",
      answer:
        "No. Market widgets and MoneyVerse guides are educational. They are not buy/sell recommendations. Use your own research or a SEBI-registered advisor.",
    },
    {
      question: "Where can I check gold price today in India?",
      answer:
        "Open the Gold Price Today guide under Finance, or use GoldVerse for hallmark and HUID context. Always confirm the final jeweller invoice including making charges and GST.",
    },
    {
      question: "Is the SIP calculator free?",
      answer:
        "Yes. SIP, FD, RD, EMI and salary tax calculators on ContentVerse India Tools are free. Results are illustrative estimates, not guarantees.",
    },
    {
      question: "What is MoneyVerse on ContentVerse India?",
      answer:
        "MoneyVerse is the personal finance hub for expense tracking, budgets, UPI screenshot OCR, and bank statement analysis — linked with Finance guides.",
    },
  ],
};

export const SPORTS_HUB_SEO: HubSeoConfig = {
  path: "/sports",
  name: "Sports — Live Cricket Scores India",
  description:
    "Live cricket scores India, IPL fixtures, match results, Team India updates and sports blogs on ContentVerse India.",
  faqs: [
    {
      question: "Are live cricket scores on ContentVerse India official?",
      answer:
        "Scores and fixtures are real-time utilities for fans. For official tournament records, also check the governing board or tournament site.",
    },
    {
      question: "Can I read cricket analysis here?",
      answer:
        "Yes. Besides live widgets, ContentVerse India publishes original sports blogs, previews and opinion from creators under the Sports category.",
    },
    {
      question: "Do you cover IPL and international matches?",
      answer:
        "The Sports Hub focuses on live and upcoming cricket fixtures popular with Indian fans, including IPL and Team India series when available in the feed.",
    },
  ],
};

export const CINEVERSE_HUB_SEO: HubSeoConfig = {
  path: "/cineverse",
  name: "CineVerse — Movies & OTT India",
  description:
    "Search movies for India: OTT release date, cast, trailer, story, ratings, where to watch and reviews on ContentVerse India CineVerse.",
  faqs: [
    {
      question: "How do I find where to watch a movie in India?",
      answer:
        "Open the film on CineVerse. Each movie page lists OTT availability and where-to-watch context for India when data is available.",
    },
    {
      question: "What does OTT release date mean?",
      answer:
        "It is when a title is expected or listed to stream on platforms like Netflix, Prime Video, JioCinema or others in India — separate from theatrical release.",
    },
    {
      question: "Is CineVerse affiliated with Netflix or TMDB?",
      answer:
        "No. Movie metadata is powered by TMDB. ContentVerse India is not endorsed by Netflix, Prime Video, or TMDB.",
    },
  ],
};

export const GOLDVERSE_HUB_SEO: HubSeoConfig = {
  path: "/goldverse",
  name: "GoldVerse — Gold Rate & HUID India",
  description:
    "GoldVerse helps India buyers check gold rate context, verify BIS HUID online, learn hallmark rules and spot fake gold risks.",
  pageType: "WebApplication",
  faqs: [
    {
      question: "What is HUID verification?",
      answer:
        "HUID is the Hallmark Unique ID laser-marked on BIS-hallmarked gold jewellery. GoldVerse lets you verify the 6-character code against BIS data.",
    },
    {
      question: "Is gold rate the same as jeweller bill rate?",
      answer:
        "Usually not. Spot-linked rates differ from retail invoices that add making charges, wastage and GST. Always confirm the final bill.",
    },
    {
      question: "How many free HUID checks do I get?",
      answer:
        "Signed-in users get 3 free BIS HUID checks per account on ContentVerse India. Businesses needing volume can contact us for API access.",
    },
    {
      question: "Can GoldVerse detect fake gold automatically?",
      answer:
        "No tool replaces physical testing. Use our fake-gold checklist, insist on hallmark/HUID, and buy from trusted jewellers with proper invoices.",
    },
  ],
};

export const MONEYVERSE_HUB_SEO: HubSeoConfig = {
  path: "/moneyverse",
  name: "MoneyVerse — Expense Tracker India",
  description:
    "Track UPI expenses, budgets, card/SIP reminders, screenshot OCR and bank statement analysis on ContentVerse India MoneyVerse.",
  pageType: "WebApplication",
  faqs: [
    {
      question: "Is MoneyVerse free?",
      answer:
        "Core expense tracking and budgets are free with a ContentVerse India account. Sign in to sync data securely to your profile.",
    },
    {
      question: "What is Screenshot Scan OCR?",
      answer:
        "Upload a UPI payment screenshot from PhonePe, GPay or Paytm. OCR reads amount, merchant and category to speed up expense logging.",
    },
    {
      question: "Does bank statement analyzer store my PDF?",
      answer:
        "Analysis is for your session insights (credits, debits, categories). Use it as a planning aid — not as official bank advice.",
    },
    {
      question: "How is MoneyVerse different from Finance Hub?",
      answer:
        "Finance Hub covers markets and MoneyVerse guides. MoneyVerse is your personal tracker for daily spends, budgets and document tools.",
    },
  ],
};

export const JOBS_HUB_SEO: HubSeoConfig = {
  path: "/jobs",
  name: "Jobs — Sarkari Naukri & Private Careers India",
  description:
    "Latest sarkari naukri, government job notifications, admit cards, results links and private-sector openings on ContentVerse India.",
  faqs: [
    {
      question: "Does ContentVerse India charge for job applications?",
      answer:
        "No. We aggregate listings and link to official sources. Never pay anyone on ContentVerse India to apply for a government job.",
    },
    {
      question: "Where are Sarkari Results?",
      answer:
        "Use the Sarkari Result hub for official exam and board result portals. Jobs Hub focuses on notifications, vacancies and career listings.",
    },
    {
      question: "Do you list private jobs too?",
      answer:
        "Yes. Besides government notifications, the Jobs Hub features curated private-sector openings for Indian job seekers.",
    },
    {
      question: "Can AI help with my resume?",
      answer:
        "Yes. ContentVerse India AI includes a Generate Job Resume mode tailored for India-ready drafts.",
    },
  ],
};

export const RESULTS_HUB_SEO: HubSeoConfig = {
  path: "/results",
  name: "Sarkari Result — Exam & Board Results India",
  description:
    "Official Sarkari Result links for SSC, UPSC, CBSE, IBPS, RRB, NTA, NEET, JEE and more — ContentVerse India links only to government portals.",
  faqs: [
    {
      question: "Does ContentVerse India publish marksheets?",
      answer:
        "No. We only link to official portals. Never download marksheets from random sites that ask for fees or OTPs beyond the official process.",
    },
    {
      question: "Which exams are covered?",
      answer:
        "Central exams, boards, banking, railways and defence-oriented official result portals popular in India searches — including SSC, UPSC, CBSE, IBPS, RRB and NTA-linked exams.",
    },
    {
      question: "Where do I find job notifications?",
      answer:
        "Open the Jobs Hub for sarkari naukri and private openings. Results Hub is specifically for official result portals.",
    },
  ],
};

export const TRENDING_HUB_SEO: HubSeoConfig = {
  path: "/trending",
  name: "Trending Now India — Google Trends & News",
  description:
    "Trending Now in India: Google Trends, news, cricket, entertainment, AI & tech, jobs and finance — auto-updated on ContentVerse India.",
  faqs: [
    {
      question: "How often does Trending Now update?",
      answer:
        "The hub refreshes about every 15 minutes with Google Trends spikes, news and topic lanes relevant to India.",
    },
    {
      question: "Is this the same as Google Trends?",
      answer:
        "We surface India-focused trend signals and headlines in one place. For the official Google Trends UI, visit Google’s own Trends product.",
    },
    {
      question: "Can I read explainers for why something is trending?",
      answer:
        "Yes. Pair Trending Now with India Guides — especially the trending explainers section — for deeper context.",
    },
  ],
};

export const GUIDES_HUB_FAQS: HubFaq[] = [
  {
    question: "What are India Guides on ContentVerse India?",
    answer:
      "Free explainers built for how India searches: why topics trend, govt scheme eligibility, job notifications, cricket moments, AI how-tos and OTT where-to-watch.",
  },
  {
    question: "Are scheme and job guides official?",
    answer:
      "No. Guides are educational. Always verify eligibility, fees and forms on official government websites before applying or paying anyone.",
  },
  {
    question: "Are India Guides free?",
    answer:
      "Yes. You can read them without signing up. Live hubs like Tools, Jobs and Sports are linked where useful.",
  },
];

export const TOOLS_HUB_FAQS: HubFaq[] = [
  {
    question: "Are India Tools on ContentVerse India free?",
    answer:
      "Yes. Weather, tax, PDF, IFSC, EMI, SIP, PNR helpers and more are free to use. Some advanced MoneyVerse AI tools need sign-in.",
  },
  {
    question: "Is this an official government website?",
    answer:
      "No. ContentVerse India is independent. For RC, challan or DL records use official Parivahan/Vahan portals.",
  },
  {
    question: "Do PDF tools upload my files?",
    answer:
      "Merge, split and compress PDF tools run in your browser. Files stay on your device and are not uploaded to our servers.",
  },
  {
    question: "Which tax year does the salary calculator use?",
    answer:
      "The salary tax calculator targets current FY slab estimates for planning. Always verify on the Income Tax e-filing portal before filing.",
  },
];
