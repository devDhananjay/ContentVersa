import { PILLAR_GUIDE_ARTICLES } from "./pillar-articles";
import { TOP_30_TOPIC_ARTICLES } from "./top-30-topics";
import { EVERGREEN_PACK_OCT_2026 } from "./evergreen-pack-oct2026";

export const GUIDES_HUB_PATH = "/guides";

export type GuideSectionSlug =
  | "trending"
  | "cricket"
  | "schemes"
  | "jobs"
  | "ai-tools"
  | "movies"
  | "money";

export type GuideFaq = {
  q: string;
  a: string;
};

export type GuideBlock = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GuideArticle = {
  slug: string;
  section: GuideSectionSlug;
  title: string;
  shortTitle: string;
  description: string;
  keywords: string[];
  readingMinutes: number;
  updatedLabel: string;
  blocks: GuideBlock[];
  faqs?: GuideFaq[];
  /** Optional topic-cluster id for internal linking */
  clusterId?: string;
  relatedHref?: string;
  relatedLabel?: string;
};

export type GuideSection = {
  slug: GuideSectionSlug;
  title: string;
  shortTitle: string;
  /** Homepage / hub card headline — never use bracket placeholders. */
  cardTitle: string;
  cardSubtext: string;
  description: string;
  keywords: string[];
  badge: string;
  relatedHub?: { href: string; label: string };
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    slug: "trending",
    title: "Why Is It Trending in India?",
    shortTitle: "Trending",
    cardTitle: "Daily Trend Radar — Why Topics Spike in India",
    cardSubtext:
      "Breakdown of trending discussions, viral debates, and search spikes.",
    description:
      "Clear explainers on why topics spike on Google Trends, social media, and news in India — context, timeline, and what to watch next.",
    keywords: [
      "why is it trending india",
      "google trends india",
      "trending topics explained",
    ],
    badge: "Trends",
    relatedHub: { href: "/blogs?sort=trending", label: "Trending articles" },
  },
  {
    slug: "cricket",
    title: "Cricket Match Guides — Live Updates & Key Moments",
    shortTitle: "Sports / Cricket",
    cardTitle: "Matchday Central — Live Analysis & Match Moments",
    cardSubtext:
      "Scorecard summaries, key player moments, and tournament breakdowns.",
    description:
      "How to follow India cricket match days: key moments, scorecard reading, and where to get live updates on ContentVerse India Sports.",
    keywords: [
      "cricket live updates india",
      "match key moments",
      "ipl live guide",
    ],
    badge: "Sports",
    relatedHub: { href: "/guides/cricket", label: "Cricket guides" },
  },
  {
    slug: "schemes",
    title: "Government Schemes — Eligibility & How to Apply",
    shortTitle: "Govt Schemes",
    cardTitle: "Indian Welfare Schemes — Eligibility & How to Apply",
    cardSubtext:
      "Step-by-step guides, required documents, and official application portals.",
    description:
      "India government scheme explainers: who is eligible, documents needed, and how to apply on official portals — with clear disclaimers.",
    keywords: [
      "govt schemes india",
      "pm scheme eligibility",
      "how to apply government scheme",
    ],
    badge: "Yojana",
  },
  {
    slug: "jobs",
    title: "Job Notifications — Eligibility, Salary & Last Date",
    shortTitle: "Jobs & Careers",
    cardTitle: "Sarkari & Corporate Openings — Eligibility, Pay & Deadlines",
    cardSubtext:
      "Verified vacancy notifications, salary structures, and last dates.",
    description:
      "How to read sarkari and private job notifications: eligibility, pay scale, last date, and official apply links.",
    keywords: [
      "sarkari job notification",
      "job eligibility salary last date",
      "government job guide india",
    ],
    badge: "Careers",
    relatedHub: { href: "/jobs/govt", label: "Govt jobs hub" },
  },
  {
    slug: "ai-tools",
    title: "AI Tools — How to Use Them in India",
    shortTitle: "AI Tools",
    cardTitle: "Practical AI How-tos for India",
    cardSubtext: "Setup, prompts, privacy tips, and everyday use-cases.",
    description:
      "Practical how-tos for popular AI tools — setup, prompts, privacy tips, and use-cases for students and creators in India.",
    keywords: [
      "ai tools how to use",
      "chatgpt guide india",
      "free ai tools tutorial",
    ],
    badge: "AI",
    relatedHub: { href: "/tools", label: "India Tools" },
  },
  {
    slug: "movies",
    title: "Movies & Web Series — Release, Cast & Where to Watch",
    shortTitle: "Movies / OTT",
    cardTitle: "OTT & Cinema Guides for India",
    cardSubtext: "Release dates, cast, and where to watch legally.",
    description:
      "India OTT and cinema guides: release dates, cast, and where to watch legally on Netflix, Prime, JioCinema, and more.",
    keywords: [
      "where to watch ott india",
      "movie release date cast",
      "web series india guide",
    ],
    badge: "OTT",
    relatedHub: { href: "/cineverse", label: "CineVerse" },
  },
  {
    slug: "money",
    title: "Money Guides — EMI, SIP, IFSC, Tax & GST",
    shortTitle: "Money",
    cardTitle: "Money Guides for India",
    cardSubtext: "EMI, SIP, tax, IFSC and GST explained in plain language.",
    description:
      "Practical India money explainers: EMI and SIP maths, IFSC transfers, salary tax regimes, and GST on invoices — with free calculators and clear disclaimers.",
    keywords: [
      "emi calculator guide india",
      "sip beginners india",
      "ifsc code guide",
      "salary tax regime india",
      "gst invoice calculator",
    ],
    badge: "Money",
    relatedHub: { href: "/tools", label: "India Tools" },
  },
];

export const GUIDE_ARTICLES: GuideArticle[] = [
  ...PILLAR_GUIDE_ARTICLES,
  ...TOP_30_TOPIC_ARTICLES,
  ...EVERGREEN_PACK_OCT_2026,
  {
    slug: "why-topics-trend-in-india",
    section: "trending",
    title: "Why Topics Trend in India — Google Trends & News Spikes Explained",
    shortTitle: "Why topics trend",
    description:
      "Understand why a person, meme, or news event trends in India: search demand, social virality, and news cycles — and how to verify claims.",
    keywords: ["why is it trending", "google trends india explained"],
    readingMinutes: 5,
    updatedLabel: "Jul 2026",
    relatedHref: "/blogs?sort=trending",
    relatedLabel: "See trending articles",
    blocks: [
      {
        heading: "What “trending” actually means",
        paragraphs: [
          "In India, a topic can trend on Google Search, YouTube, X/Twitter, Instagram Reels, or WhatsApp forwards — often at the same time. Google Trends shows relative search interest, not absolute visitor counts. A spike usually means many people searched the same phrase in a short window.",
          "News channels and social creators amplify the same keywords, which pushes more searches. That feedback loop is why “Why is X trending?” becomes a common query within hours.",
        ],
      },
      {
        heading: "A simple checklist before you share",
        paragraphs: [
          "Trending does not mean verified. Use this quick filter before forwarding or writing about a spike:",
        ],
        bullets: [
          "Check at least two reputable Indian news outlets for the same claim",
          "Look at Google Trends India for the keyword vs related breakout queries",
          "Prefer primary sources (official handles, court filings, company statements)",
          "Ignore screenshots without a date, URL, or named reporter",
        ],
      },
      {
        heading: "How ContentVerse India covers trends",
        paragraphs: [
          "Our Trending guides focus on context: what happened, why searches rose, and what is still unconfirmed. For evergreen reading, open Trending articles on the blogs hub. For live sports or market spikes, jump to Sports or Finance instead of rumour threads.",
        ],
      },
    ],
  },
  {
    slug: "how-to-read-google-trends-india",
    section: "trending",
    title: "How to Read Google Trends India (Breakout Queries & Regions)",
    shortTitle: "Google Trends India",
    description:
      "Step-by-step guide to Google Trends for India: interest over time, breakout queries, related topics, and state-level interest.",
    keywords: ["google trends india tutorial", "breakout queries india"],
    readingMinutes: 5,
    updatedLabel: "Jul 2026",
    blocks: [
      {
        heading: "Set the geography to India",
        paragraphs: [
          "Open trends.google.com, search your keyword, and set the region to India. Compare the last 24 hours (fast news) with past 7 days or 90 days (lasting interest). A one-day spike that disappears is usually a news burst; a week-long rise may be a product launch or exam cycle.",
        ],
      },
      {
        heading: "Use related queries",
        paragraphs: [
          "The “Related queries” panel is often more useful than the main chart. Breakout queries (marked Rising / Breakout) show what people type next — for example a celebrity name plus “wife”, “net worth”, or “died”. Those phrases reveal intent and help you write a useful explainer instead of a vague headline.",
        ],
        bullets: [
          "Rising = growing vs previous period",
          "Breakout = huge relative increase (treat carefully — can be rumour-driven)",
          "Compare Hindi and English spellings separately when relevant",
        ],
      },
    ],
  },
  {
    slug: "live-cricket-match-day-guide",
    section: "cricket",
    title: "Cricket Match Day Guide — Live Updates & Key Moments",
    shortTitle: "Match day guide",
    description:
      "Follow an India cricket match day the smart way: toss, key moments, scorecard basics, and where to get live updates without spam.",
    keywords: ["cricket live updates", "match key moments india", "ipl match day guide"],
    readingMinutes: 9,
    updatedLabel: "Oct 2026",
    relatedHref: "/guides/cricket",
    relatedLabel: "More cricket guides",
    clusterId: "cricket",
    blocks: [
      {
        heading: "What to track during a live match",
        paragraphs: [
          "A useful match guide is not only the final score. Note toss and decision, powerplay or new-ball phases, partnerships that change the game, reviews, and bowling spells that swing momentum. Those “key moments” are what fans search for hours after the match.",
          "Keep a simple notepad (phone notes are fine): over number, score, and one line on why the moment mattered. That habit turns chaotic live feeds into something you can explain to friends later.",
        ],
        bullets: [
          "Toss + pitch note (bat/bowl first)",
          "Breakthrough wickets and partnerships",
          "Death overs / slog overs impact",
          "Player of the match context (not only the award name)",
        ],
      },
      {
        heading: "Format-specific checkpoints",
        paragraphs: [
          "In T20, the first six and last five overs usually decide the narrative. In ODIs, middle-overs control and death bowling still matter more than one early boundary. In Tests, sessions and new-ball spells matter more than a single over’s run rate.",
          "If you only have 20 minutes to catch up, jump to: current required rate (chase), last five overs summary, and top two bowling figures — then skim partnerships.",
        ],
      },
      {
        heading: "Legal watching and spam avoidance",
        paragraphs: [
          "Prefer official broadcasters and licensed apps in India. Unofficial “HD free stream” links are malware and piracy risks. Mute keyword spam in social apps so match alerts do not bury real updates.",
        ],
      },
      {
        heading: "Where to follow on ContentVerse India",
        paragraphs: [
          "Use cricket guides for match-day context and scorecard literacy, then read Sports category articles for written previews and explainers. Live score widgets stay separate from our indexable editorial guides on purpose — guides are built for search and clarity, not raw tickers.",
        ],
      },
    ],
    faqs: [
      {
        q: "What should I check first if I join a match late?",
        a: "Toss decision, current score vs overs, required rate if chasing, and the last wicket — then scan bowling figures.",
      },
      {
        q: "Where should I watch legally in India?",
        a: "Use the official broadcaster or licensed streaming partner for that series. Avoid random free-stream sites.",
      },
      {
        q: "Do live score apps replace match guides?",
        a: "Scores show state; guides explain context (pitch, phases, why a spell mattered). Use both if you want depth.",
      },
    ],
  },
  {
    slug: "how-to-read-a-cricket-scorecard",
    section: "cricket",
    title: "How to Read a Cricket Scorecard (India Fans’ Quick Guide)",
    shortTitle: "Read a scorecard",
    description:
      "Learn batting, bowling, extras, and run-rate lines on an Indian cricket scorecard so live updates make sense.",
    keywords: ["how to read cricket scorecard", "cricket extras explained", "strike rate economy rate"],
    readingMinutes: 8,
    updatedLabel: "Oct 2026",
    relatedHref: "/category/sports",
    relatedLabel: "Sports articles",
    clusterId: "cricket",
    blocks: [
      {
        heading: "Batting line",
        paragraphs: [
          "Runs (R), balls (B), fours, sixes, and strike rate tell how a batter scored. “Not out” means they were still batting when the innings ended. Fall of wickets shows when momentum shifted.",
          "A high strike rate on few balls can look flashy but may not build an innings; pair strike rate with partnership context before judging a knock.",
        ],
      },
      {
        heading: "Bowling & extras",
        paragraphs: [
          "Overs, maidens, runs conceded, and wickets form the bowling summary. Extras (wides, no-balls, byes, leg-byes) are runs not credited to a batter. In T20, economy rate often matters as much as wickets.",
          "If extras are high, ask whether wicketkeepers missed byes or bowlers sprayed wides under pressure — the scorecard hint is there even without commentary.",
        ],
      },
      {
        heading: "Run rate, projected totals, and chase math",
        paragraphs: [
          "Current run rate is runs per over so far. Required rate appears in chases. Projected totals assume the current rate continues — useful as a snapshot, not destiny, especially after a collapse or a powerplay surge.",
        ],
        bullets: [
          "Compare required rate vs career death-over strengths of batters still in",
          "Note wickets in hand — five wickets with a high required rate is different from two",
          "In rain-affected games, check DLS/DLS-style targets on official cards when shown",
        ],
      },
      {
        heading: "Practice drill",
        paragraphs: [
          "Open any completed India or IPL scorecard and explain the match in five sentences using only the card: who set the tone, which spell flipped the game, and how extras or partnerships mattered. That drill builds literacy faster than reading definitions alone.",
        ],
      },
    ],
    faqs: [
      {
        q: "What does economy rate mean?",
        a: "Runs conceded per over bowled. Lower is better for the bowling side, especially in limited overs.",
      },
      {
        q: "Are extras counted in the team total?",
        a: "Yes. Extras add to the batting side’s total but are not credited to an individual batter.",
      },
      {
        q: "Why do some cards show SR and others emphasise balls faced?",
        a: "Formats differ. T20 cards emphasise strike rate; Tests often emphasise time and balls for longer occupations.",
      },
    ],
  },
  {
    slug: "how-to-read-a-cricket-match-preview",
    section: "cricket",
    title: "How to Read a Cricket Match Preview (India Fans)",
    shortTitle: "Match preview guide",
    description:
      "Decode pitch reports, team news, form guides, and head-to-head notes so match previews help you before the first ball — without junk tips.",
    keywords: [
      "cricket match preview explained",
      "pitch report india cricket",
      "ipl preview how to read",
    ],
    readingMinutes: 8,
    updatedLabel: "Oct 2026",
    relatedHref: "/guides/cricket",
    relatedLabel: "Cricket guides",
    clusterId: "cricket",
    blocks: [
      {
        heading: "What a good preview must cover",
        paragraphs: [
          "Venue and pitch tendency (help pace / spin / true bounce), weather and dew risk, confirmed XI or likely XI, injury news, and one form note per key player. Skip “sure-shot fantasy tips” that never show uncertainty.",
        ],
        bullets: [
          "Pitch + average first-innings scores at the venue (recent)",
          "Toss importance in that format and ground",
          "Matchups: spinner vs middle order, death bowlers vs finishers",
        ],
      },
      {
        heading: "Form vs matchup",
        paragraphs: [
          "A batter in form can still struggle against a specific length or a left-arm angle. Previews that only list last five scores miss matchups. Look for one concrete bowling plan vs one batting strength.",
        ],
      },
      {
        heading: "How ContentVerse India uses previews",
        paragraphs: [
          "We keep live score widgets separate from indexable explainers. Read previews and scorecard guides here; use official apps for ball-by-ball. That split keeps pages useful for Google and safe for readers.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are pitch reports always accurate?",
        a: "No. They are informed guesses. Treat them as a starting bias, then adjust after the first few overs.",
      },
      {
        q: "Should I trust fantasy “confirmed XI” leaks?",
        a: "Prefer team socials and official broadcaster graphics close to toss. Early leaks are often wrong.",
      },
    ],
  },
  {
    slug: "pm-kisan-eligibility-how-to-apply",
    section: "schemes",
    title: "PM-KISAN — Eligibility & How to Apply (India Guide)",
    shortTitle: "PM-KISAN guide",
    description:
      "Overview of PM-KISAN farmer support: who is typically eligible, documents commonly needed, and how to apply or check status on the official portal.",
    keywords: [
      "pm kisan eligibility",
      "pm kisan how to apply",
      "pm kisan yojana",
    ],
    readingMinutes: 6,
    updatedLabel: "Jul 2026",
    blocks: [
      {
        heading: "What the scheme is",
        paragraphs: [
          "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi) is a Central government income-support scheme for eligible landholding farmer families in India. Benefits and rules can change — always confirm on the official PM-KISAN portal before applying.",
        ],
      },
      {
        heading: "Eligibility (high-level)",
        paragraphs: [
          "In general, the scheme targets farmer families who own cultivable land as per state land records. Many institutional landholders and higher-income categories are excluded. States upload beneficiary data; farmers should verify their name, Aadhaar seeding, and bank account details.",
        ],
        bullets: [
          "Confirm land record details with your state revenue / agriculture office if needed",
          "Keep Aadhaar and bank account linked and active",
          "Use only pmkisan.gov.in (or the official app/link published by the Ministry)",
        ],
      },
      {
        heading: "How to apply / check status",
        paragraphs: [
          "New registrations and e-KYC are handled through the official website or authorised Common Service Centres (CSC), depending on your state’s process. After submission, track payment status and e-KYC flags on the same portal. ContentVerse India does not collect scheme applications — we only explain the process.",
        ],
      },
    ],
  },
  {
    slug: "how-to-read-sarkari-job-notification",
    section: "jobs",
    title: "How to Read a Sarkari Job Notification (Eligibility, Salary, Last Date)",
    shortTitle: "Read job notifications",
    description:
      "Decode government job ads: post name, vacancy, age limit, education, pay level, fee, and last date — before you apply.",
    keywords: [
      "how to read sarkari naukri notification",
      "job eligibility salary last date",
    ],
    readingMinutes: 6,
    updatedLabel: "Jul 2026",
    relatedHref: "/jobs/govt",
    relatedLabel: "Browse govt jobs",
    blocks: [
      {
        heading: "Start with post + vacancy + last date",
        paragraphs: [
          "Open the official PDF from the commission or department website. Note the exact post name, number of vacancies, opening date, and closing date/time (IST). Set a reminder 48 hours before the last date — portals often slow down near deadlines.",
        ],
      },
      {
        heading: "Eligibility & salary lines",
        paragraphs: [
          "Age limits usually include category relaxations (OBC/SC/ST/PwBD/Ex-servicemen) — read the relaxation table carefully. Education must match the notification wording (for example “degree from a recognised university”). Pay is often shown as Pay Level / matrix plus allowances; take-home differs by city and deductions.",
        ],
        bullets: [
          "Confirm age as on the date mentioned in the notice",
          "Check whether experience is essential or desirable",
          "Note application fee and exemption categories",
        ],
      },
      {
        heading: "Apply on the official link only",
        paragraphs: [
          "Use the URL printed in the notification. ContentVerse India Jobs lists government updates and deep-links to official sources where available — always complete payment and final submit on the commission’s site.",
        ],
      },
    ],
  },
  {
    slug: "ssc-style-exam-notification-checklist",
    section: "jobs",
    title: "SSC-Style Exam Notification Checklist for First-Time Applicants",
    shortTitle: "Exam notification checklist",
    description:
      "A practical checklist for SSC and similar central exam notices: registration, documents, photo specs, and correction window.",
    keywords: ["ssc notification checklist", "sarkari exam apply guide", "ssc otr photo signature"],
    readingMinutes: 9,
    updatedLabel: "Oct 2026",
    relatedHref: "/jobs/govt",
    relatedLabel: "Latest govt updates",
    clusterId: "jobs",
    blocks: [
      {
        heading: "Before you register",
        paragraphs: [
          "Keep a valid email and mobile number you can access for months. Scan photo and signature to the exact pixel/KB limits in the notice. Name and date of birth must match educational certificates and Aadhaar where required.",
        ],
        bullets: [
          "One-time registration (OTR) details saved securely",
          "Category certificate ready if claiming reservation",
          "Fee payment method that works on exam portals",
        ],
      },
      {
        heading: "Photo, signature, and document traps",
        paragraphs: [
          "Most rejections at form stage are file-spec failures: wrong background, oversized JPG, or signature thicker than allowed. Resize with a simple tool, keep originals, and test upload early — do not wait for the last evening when portals lag.",
        ],
      },
      {
        heading: "After submitting",
        paragraphs: [
          "Download the application printout. Watch for correction windows — many boards allow limited field edits for a short period. Admit cards release later on the same portal; do not trust random Telegram forwards.",
          "Set calendar reminders for fee deadlines, correction windows, and admit-card dates. Screenshot successful payment references.",
        ],
      },
      {
        heading: "Pair with ContentVerse India Jobs",
        paragraphs: [
          "Browse government listings on /jobs/govt, then always finish apply + payment on the commission’s official URL printed in the PDF. Read our “how to read a sarkari notification” guide before you chase every vacancy.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I change my photo after final submit?",
        a: "Only if the board opens a correction window and that field is editable. Otherwise you may need to wait for the next cycle — read the notice.",
      },
      {
        q: "Is CSC help mandatory?",
        a: "No for most central exams if you can self-register. CSC can help with uploads, but keep your own login credentials.",
      },
      {
        q: "Where do I get admit cards?",
        a: "Only from the official exam portal linked in the notification. Ignore paid “admit card download” scam sites.",
      },
    ],
  },
  {
    slug: "how-to-verify-govt-scheme-before-you-apply",
    section: "schemes",
    title: "How to Verify a Government Scheme Before You Apply",
    shortTitle: "Verify schemes safely",
    description:
      "Avoid fraud: check official .gov.in domains, helplines, and documents before sharing Aadhaar or paying agents for government schemes.",
    keywords: [
      "government scheme fraud india",
      "verify pm scheme official website",
    ],
    readingMinutes: 8,
    updatedLabel: "Oct 2026",
    relatedHref: "/guides/schemes",
    relatedLabel: "More scheme guides",
    blocks: [
      {
        heading: "Official sources only",
        paragraphs: [
          "Real Central and State schemes publish details on .gov.in / .nic.in sites or the India.gov.in directory. Be careful with WhatsApp PDFs that ask for fees to “approve” a scheme. Most genuine applications do not need you to pay a private agent.",
        ],
        bullets: [
          "Match the scheme name on an official ministry or MyGov page",
          "Never share OTP / Aadhaar QR casually over chat",
          "Prefer CSC / state portals for assisted applications",
        ],
      },
      {
        heading: "Documents checklist pattern",
        paragraphs: [
          "Most schemes ask for identity (Aadhaar), bank details, and a category proof (income, caste, farmer land, disability, etc.). Photocopy and keep soft copies ready, but upload only on official forms.",
        ],
      },
      {
        heading: "Fee and agent red flags",
        paragraphs: [
          "If someone demands cash to “speed up PM scheme money” or asks you to install an unknown APK, stop. Genuine grievance redressal goes through official helplines and portals. Cross-check any QR payment request against the scheme’s published process.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I know a website is official?",
        a: "Look for .gov.in / .nic.in domains and HTTPS. Be wary of lookalike spellings and random .com “registration” clones.",
      },
      {
        q: "Should I pay an agent for PM-KISAN or similar?",
        a: "You should not need private fees to “approve” benefits. Use official portals or authorised CSC where published.",
      },
    ],
  },
  {
    slug: "chatgpt-how-to-use-for-students-india",
    section: "ai-tools",
    title: "ChatGPT — How to Use It for Studies in India (Practical Guide)",
    shortTitle: "ChatGPT for students",
    description:
      "A simple India-focused guide to using ChatGPT for explanations, practice questions, and writing help — plus privacy and academic honesty tips.",
    keywords: ["chatgpt how to use india", "ai for students india"],
    readingMinutes: 5,
    updatedLabel: "Jul 2026",
    relatedHref: "/tools",
    relatedLabel: "Free India tools",
    blocks: [
      {
        heading: "Good uses",
        paragraphs: [
          "Ask for step-by-step explanations of a concept, alternative examples, or a quiz on a chapter you already studied. Paste your own notes and request a shorter revision sheet. For language practice, ask it to correct grammar and explain why.",
        ],
      },
      {
        heading: "Limits & honesty",
        paragraphs: [
          "Models can invent facts, especially dates and citations. Cross-check exam-critical information with textbooks and official syllabi. Do not submit AI text as your own assignment if your school or university forbids it — use AI as a tutor, not a ghostwriter.",
        ],
        bullets: [
          "Never paste passwords, OTPs, or full ID documents into chat tools",
          "Prefer official apps/sites; avoid cracked “premium” APKs",
          "For maths, verify every step yourself",
        ],
      },
    ],
  },
  {
    slug: "free-ai-tools-starter-pack-india",
    section: "ai-tools",
    title: "Free AI Tools Starter Pack for Creators in India",
    shortTitle: "Free AI starter pack",
    description:
      "A practical starter set of free AI tools for writing, images, and productivity — with safety notes for Indian creators.",
    keywords: ["free ai tools india", "ai tools for creators"],
    readingMinutes: 5,
    updatedLabel: "Jul 2026",
    relatedHref: "/tools",
    relatedLabel: "ContentVerse India tools",
    blocks: [
      {
        heading: "Pick tools by job-to-be-done",
        paragraphs: [
          "Use one chat model for drafting, one image tool for thumbnails, and a transcript/summary tool for long videos. Switching between ten apps usually wastes time. Start with free tiers, export your work, and keep an offline copy.",
        ],
      },
      {
        heading: "Pair AI with ContentVerse India utilities",
        paragraphs: [
          "After drafting, use ContentVerse India Tools for calculators, PDF merge/split, and salary tax estimates — tasks that need deterministic answers, not generative guesses.",
        ],
      },
    ],
  },
  {
    slug: "where-to-watch-ott-india",
    section: "movies",
    title: "Where to Watch Movies & Web Series in India (OTT Guide)",
    shortTitle: "Where to watch OTT",
    description:
      "Find legal OTT options in India — how to check release windows, platform exclusives, and why piracy links are risky.",
    keywords: [
      "where to watch ott india",
      "netflix prime jiocinema guide",
      "hotstar zee5 sony liv india",
    ],
    readingMinutes: 9,
    updatedLabel: "Oct 2026",
    relatedHref: "/cineverse",
    relatedLabel: "Open CineVerse",
    clusterId: "movies",
    blocks: [
      {
        heading: "Release windows differ by title",
        paragraphs: [
          "Theatrical films may hit OTT weeks or months later. Some shows are exclusive to one platform in India even if they air elsewhere globally. Always check the platform’s India catalogue or an official press note — third-party “watch free” sites are often malware or piracy.",
        ],
      },
      {
        heading: "How to verify “where to watch” quickly",
        paragraphs: [
          "Search the title plus the platform name, then open the official app/store listing for India. Provider chips on CineVerse are a starting point — confirm availability in your city plan (mobile vs TV rights sometimes differ).",
        ],
        bullets: [
          "Prefer official apps: Netflix, Prime Video, JioCinema, Disney+ Hotstar, Zee5, SonyLIV, and others as licensed",
          "Ignore Telegram “drive links” and random APK streamers",
          "Check language / dub tracks before renting or buying",
        ],
      },
      {
        heading: "Subscriptions without waste",
        paragraphs: [
          "Stack only the one or two apps you finish shows on. Rotate monthly if your watchlist moves. Family plans help only when everyone actually uses the same service — otherwise you pay for shelfware.",
        ],
      },
      {
        heading: "Use CineVerse to track interest",
        paragraphs: [
          "Browse and save titles on CineVerse, then confirm the legal streaming home on the official OTT app. Pair with our release/cast checklist guide when you are writing or sharing a recommendation.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why is a show on Netflix US but not India?",
        a: "Licensing is territory-specific. Global buzz does not guarantee an India window on the same platform or date.",
      },
      {
        q: "Are free movie sites safe?",
        a: "Usually not. They often push malware, stolen credentials, or piracy. Use licensed OTT or theatrical tickets.",
      },
      {
        q: "How soon do Bollywood films hit OTT?",
        a: "Windows vary by studio deal — often several weeks after theatrical, sometimes longer for big festivals.",
      },
    ],
  },
  {
    slug: "movie-release-cast-watch-checklist",
    section: "movies",
    title: "Movie / Web Series Checklist — Release Date, Cast & Where to Watch",
    shortTitle: "Release & cast checklist",
    description:
      "A reusable checklist for any India movie or web series page: release date, cast, certification, and legal watch options.",
    keywords: [
      "movie release date cast where to watch",
      "web series india checklist",
    ],
    readingMinutes: 8,
    updatedLabel: "Oct 2026",
    relatedHref: "/cineverse",
    relatedLabel: "Browse movies",
    clusterId: "movies",
    blocks: [
      {
        heading: "Minimum useful facts",
        paragraphs: [
          "Readers searching for a film’s cast or OTT window want structured answers. Cover: official release date (India), primary cast, director, language, age rating if announced, and confirmed streaming or theatrical status.",
        ],
        bullets: [
          "Release date (India) + format (theatre / OTT / both)",
          "Main cast (3–6 names) + creator/director",
          "Where to watch legally (or “theatrical only for now”)",
          "One-line spoiler-free premise",
        ],
      },
      {
        heading: "Certification and language notes",
        paragraphs: [
          "If a CBFC certificate or platform age rating is public, mention it. Note original language and whether dubs/subs are confirmed for India — a common search fail point.",
        ],
      },
      {
        heading: "How ContentVerse India structures movie pages",
        paragraphs: [
          "Our Movies / OTT guides lead with release date, cast, and where to watch in India. CineVerse detail pages stay indexable only when there is a real overview; thin TMDB shells stay noindex so Google sees quality, not empty templates.",
        ],
      },
    ],
    faqs: [
      {
        q: "What if the OTT date is not announced?",
        a: "Say “theatrical only for now” or “OTT TBA” rather than inventing a date. Update when a studio or platform confirms.",
      },
      {
        q: "How many cast names are enough?",
        a: "Three to six primary names plus the director/creator covers most search intent without turning the page into a full IMDb dump.",
      },
    ],
  },
];

export function getGuideSection(slug: string): GuideSection | undefined {
  return GUIDE_SECTIONS.find((s) => s.slug === slug);
}

export function getGuidesBySection(section: GuideSectionSlug): GuideArticle[] {
  return GUIDE_ARTICLES.filter((g) => g.section === section);
}

export function getGuideArticle(
  section: string,
  slug: string
): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((g) => g.section === section && g.slug === slug);
}

export function guideSectionPath(slug: GuideSectionSlug) {
  return `${GUIDES_HUB_PATH}/${slug}`;
}

export function guideArticlePath(article: GuideArticle) {
  return `${GUIDES_HUB_PATH}/${article.section}/${article.slug}`;
}

export function guideSitemapEntries() {
  return [
    {
      path: GUIDES_HUB_PATH,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...GUIDE_SECTIONS.map((s) => ({
      path: guideSectionPath(s.slug),
      changeFrequency: "weekly" as const,
      priority: 0.86,
    })),
    ...GUIDE_ARTICLES.map((a) => ({
      path: guideArticlePath(a),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
