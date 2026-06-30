import { cache } from "react";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { CONTACT_EMAIL, LEGACY_CONTACT_EMAIL, normalizeContactEmail } from "@/lib/site-contact";

export type SitePageSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  cards?: { title: string; description: string; meta?: string }[];
  callout?: string;
};

export type SitePageData = {
  slug: string;
  title: string;
  subtitle: string;
  badge?: string;
  sections: SitePageSection[];
  updatedAt?: string;
};

export const SITE_PAGE_SLUGS = [
  "about",
  "careers",
  "press",
  "premium",
  "creator-program",
  "terms",
  "privacy",
  "cookies",
  "policy",
] as const;

export type SitePageSlug = (typeof SITE_PAGE_SLUGS)[number];

const DEFAULT_PAGES: Record<SitePageSlug, Omit<SitePageData, "updatedAt">> = {
  about: {
    slug: "about",
    badge: "Company",
    title: "Building the home for bold writers",
    subtitle:
      "ContentVerse is a creator-first publishing platform — built in India, for readers and writers who care about depth, design, and fair monetization.",
    sections: [
      {
        heading: "Our mission",
        paragraphs: [
          "We started ContentVerse because great writing deserves more than a noisy feed and a broken payout model. Our goal is simple: help creators publish beautifully, grow an audience that actually reads, and earn in rupees — transparently.",
          "From long-form essays and News in 60 shorts to polls, tips, and creator dashboards — every feature is designed around the writer's studio, not the algorithm's mood.",
        ],
      },
      {
        heading: "What we believe",
        bullets: [
          "Readers reward depth — not clickbait.",
          "Creators should own their audience and their earnings.",
          "Moderation should be human, fast, and fair.",
          "India's internet deserves world-class editorial tools.",
        ],
      },
      {
        heading: "By the numbers",
        cards: [
          { title: "Categories", description: "Technology, lifestyle, culture, and more — with room to grow.", meta: "21+ topics" },
          { title: "Creator tools", description: "Drafts, SEO, AI assist, analytics, tips, and notifications.", meta: "All-in-one" },
          { title: "Payouts", description: "Wallet, tips, and revenue tracking in INR.", meta: "₹ native" },
        ],
      },
      {
        callout: `Questions? Write to ${CONTACT_EMAIL} — we read every message.`,
      },
    ],
  },
  careers: {
    slug: "careers",
    badge: "Careers",
    title: "Come build ContentVerse with us",
    subtitle:
      "We're a small, focused team shipping fast for creators. If you love writing, product, or community — we'd like to meet you.",
    sections: [
      {
        heading: "Open roles",
        cards: [
          {
            title: "Full-stack Engineer",
            description: "Next.js, Prisma, Postgres — ship creator-facing features end to end.",
            meta: "Remote · India",
          },
          {
            title: "Community & Creator Success",
            description: "Onboard writers, run feedback loops, and grow the creator program.",
            meta: "Remote · India",
          },
          {
            title: "Editorial Associate",
            description: "Review submissions, improve discoverability, and uphold content quality.",
            meta: "Part-time · Remote",
          },
        ],
      },
      {
        heading: "How we work",
        bullets: [
          "Async-first with clear ownership",
          "Ship weekly, measure what matters",
          "Creator feedback drives the roadmap",
          "Inclusive, no-ego collaboration",
        ],
      },
      {
        callout: `Don't see your role? Email ${CONTACT_EMAIL} with your portfolio or GitHub.`,
      },
    ],
  },
  press: {
    slug: "press",
    badge: "Press",
    title: "Press & media",
    subtitle:
      "Resources for journalists, partners, and creators covering ContentVerse.",
    sections: [
      {
        heading: "About ContentVerse",
        paragraphs: [
          "ContentVerse (contentverse.co.in) is a creator publishing platform focused on long-form writing, short news formats, monetization in INR, and community features like polls, tips, and leaderboards.",
        ],
      },
      {
        heading: "Press contact",
        bullets: [
          `Email: ${CONTACT_EMAIL}`,
          "Based in India",
          "Response within 2 business days",
        ],
      },
      {
        heading: "Brand assets",
        cards: [
          { title: "Logo & name", description: "Use “ContentVerse” — one word, capital C and V." },
          { title: "Product description", description: "A next-generation creator platform for readers and writers." },
          { title: "Founding narrative", description: "Built to give Indian creators fair tools, rupee payouts, and editorial quality." },
        ],
      },
    ],
  },
  premium: {
    slug: "premium",
    badge: "Premium",
    title: "ContentVerse Premium",
    subtitle:
      "Unlock deeper analytics, priority review, and premium placement for your best work — priced fairly in rupees.",
    sections: [
      {
        heading: "What's included",
        cards: [
          {
            title: "Priority review",
            description: "Faster moderation queue for Premium-tagged submissions.",
            meta: "Creators",
          },
          {
            title: "Enhanced analytics",
            description: "30-day views, completion rate, and revenue breakdown.",
            meta: "Dashboard",
          },
          {
            title: "Premium badge",
            description: "Stand out on Explore, category pages, and your profile.",
            meta: "Visibility",
          },
          {
            title: "Paid posts",
            description: "Mark select articles as Premium for subscriber-only access.",
            meta: "Monetization",
          },
        ],
      },
      {
        heading: "Pricing",
        paragraphs: [
          "Premium creator plan: ₹199/month — cancel anytime.",
          "Reader Premium (ad-light experience + exclusive posts): ₹199/month.",
          "Tips and one-time paid posts are always available on the free plan.",
        ],
      },
      {
        callout: `Interested in early access? Contact ${CONTACT_EMAIL} from your creator dashboard email.`,
      },
    ],
  },
  "creator-program": {
    slug: "creator-program",
    badge: "Creators",
    title: "ContentVerse Creator Program",
    subtitle:
      "Publish, grow, and earn — with editorial support, verification, and monetization built in.",
    sections: [
      {
        heading: "Who it's for",
        paragraphs: [
          "Writers, journalists, educators, and indie creators who publish original work in English or Hindi. You don't need a huge following — consistency and quality matter more.",
        ],
      },
      {
        heading: "Benefits",
        bullets: [
          "Verified creator badge after approval",
          "Tips in ₹ directly to your wallet",
          "Leaderboard & category featuring",
          "Push notifications when readers engage",
          "AI writing assist for drafts & SEO",
          "Fair moderation with human review",
        ],
      },
      {
        heading: "How to join",
        cards: [
          { title: "1. Create account", description: "Sign up at contentverse.co.in and complete your profile.", meta: "Free" },
          { title: "2. Publish 2 posts", description: "Submit original articles for review.", meta: "Quality bar" },
          { title: "3. Apply for verification", description: `Email ${CONTACT_EMAIL} with your username.`, meta: "Review ~7 days" },
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    badge: "Legal",
    title: "Terms of Service",
    subtitle: "Last updated: June 2026. By using ContentVerse you agree to these terms.",
    sections: [
      {
        heading: "Using the platform",
        paragraphs: [
          "You must provide accurate account information and keep your credentials secure. You are responsible for activity under your account.",
          "You may not scrape, spam, impersonate others, or attempt to disrupt the service.",
        ],
      },
      {
        heading: "Your content",
        bullets: [
          "You retain ownership of what you publish.",
          "You grant ContentVerse a license to host, display, and promote your work on the platform.",
          "You confirm you have rights to all material you upload (text, images, media).",
          "We may remove content that violates our Content Policy or applicable law.",
        ],
      },
      {
        heading: "Payments & tips",
        paragraphs: [
          "Tips and earnings are shown in INR. Payout timing and methods are described in your dashboard and may change with notice.",
          "Fees, taxes, and third-party payment processing may apply where relevant.",
        ],
      },
      {
        heading: "Limitation of liability",
        paragraphs: [
          "ContentVerse is provided as-is to the extent permitted by law. We are not liable for indirect damages arising from use of the service.",
        ],
      },
      {
        callout: `Questions: ${CONTACT_EMAIL}`,
      },
    ],
  },
  privacy: {
    slug: "privacy",
    badge: "Legal",
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your information.",
    sections: [
      {
        heading: "Information we collect",
        bullets: [
          "Account details: name, email, username, profile info",
          "Usage data: pages read, reading time, likes, comments",
          "Device & cookies: session, preferences, push notification tokens",
          "Payment-related metadata for tips and payouts (not full card numbers on our servers)",
        ],
      },
      {
        heading: "How we use it",
        paragraphs: [
          "To run the product — authentication, personalization, analytics for creators, moderation, and notifications you opt into.",
          "We do not sell your personal data to third-party advertisers.",
        ],
      },
      {
        heading: "Your choices",
        bullets: [
          "Update profile and notification settings in Dashboard",
          `Request account deletion via ${CONTACT_EMAIL}`,
          "Disable push notifications in browser or device settings",
        ],
      },
      {
        heading: "Data retention",
        paragraphs: [
          "We keep data while your account is active and as needed for legal, security, and payout records.",
        ],
      },
    ],
  },
  cookies: {
    slug: "cookies",
    badge: "Legal",
    title: "Cookie Policy",
    subtitle: "How ContentVerse uses cookies and similar technologies.",
    sections: [
      {
        heading: "What we use cookies for",
        bullets: [
          "Essential: sign-in sessions, security, load balancing",
          "Preferences: theme (light/dark), remembered login identifier",
          "Analytics: aggregated visit counts and reading patterns",
          "Visitor key: anonymous reading history for recommendations",
        ],
      },
      {
        heading: "Managing cookies",
        paragraphs: [
          "You can block cookies in your browser settings. Some features (sign-in, reading history, push) may not work correctly if essential cookies are disabled.",
        ],
      },
      {
        heading: "Third parties",
        paragraphs: [
          "We may use trusted providers for authentication, push delivery, and infrastructure. Their use of data is governed by their own policies.",
        ],
      },
    ],
  },
  policy: {
    slug: "policy",
    badge: "Legal",
    title: "Content Policy",
    subtitle: "Standards for publishing on ContentVerse.",
    sections: [
      {
        heading: "We welcome",
        bullets: [
          "Original essays, reporting, tutorials, and opinion with clear sourcing",
          "Respectful debate and constructive criticism",
          "Proper attribution for quotes, images, and data",
        ],
      },
      {
        heading: "Not allowed",
        bullets: [
          "Hate speech, harassment, or threats",
          "Plagiarism or mass AI spam without editorial value",
          "Illegal content, malware, or dangerous instructions",
          "Misleading health or financial claims without evidence",
          "Explicit adult content or gratuitous violence",
        ],
      },
      {
        heading: "Moderation",
        paragraphs: [
          "Submissions may be pending review before going live. Moderators can approve, request edits, or reject work that breaks this policy.",
          "Repeat violations may lead to suspension or removal from the Creator Program.",
        ],
      },
      {
        callout: `Report concerns: ${CONTACT_EMAIL}`,
      },
    ],
  },
};

function normalizeSitePageSections(sections: SitePageSection[]): SitePageSection[] {
  return sections.map((section) => ({
    ...section,
    paragraphs: section.paragraphs?.map(normalizeContactEmail),
    bullets: section.bullets?.map(normalizeContactEmail),
    callout: section.callout ? normalizeContactEmail(section.callout) : section.callout,
    cards: section.cards?.map((card) => ({
      ...card,
      description: normalizeContactEmail(card.description),
      title: normalizeContactEmail(card.title),
      meta: card.meta ? normalizeContactEmail(card.meta) : card.meta,
    })),
  }));
}

function sectionsContainLegacyEmail(sections: SitePageSection[]): boolean {
  const blob = JSON.stringify(sections);
  return blob.includes(LEGACY_CONTACT_EMAIL);
}

function mapDbRow(row: {
  slug: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  sections: unknown;
  updatedAt: Date;
}): SitePageData {
  const raw = Array.isArray(row.sections) ? (row.sections as SitePageSection[]) : [];
  const sections = normalizeSitePageSections(raw);
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    badge: row.badge ?? undefined,
    sections,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Slugs whose DB copy is refreshed from code defaults on boot. */
const SYNC_FROM_DEFAULTS: SitePageSlug[] = ["premium"];

export async function ensureSitePagesInDb() {
  if (!isDatabaseConfigured()) return;
  for (const slug of SITE_PAGE_SLUGS) {
    const def = DEFAULT_PAGES[slug];
    const sync = SYNC_FROM_DEFAULTS.includes(slug);
    await prisma.sitePage.upsert({
      where: { slug },
      create: {
        slug,
        title: def.title,
        subtitle: def.subtitle,
        badge: def.badge ?? null,
        sections: def.sections,
      },
      update: sync
        ? {
            title: def.title,
            subtitle: def.subtitle,
            badge: def.badge ?? null,
            sections: def.sections,
          }
        : {},
    });
  }

  const rows = await prisma.sitePage.findMany({ select: { id: true, sections: true } });
  for (const row of rows) {
    const raw = Array.isArray(row.sections) ? (row.sections as SitePageSection[]) : [];
    if (!sectionsContainLegacyEmail(raw)) continue;
    await prisma.sitePage.update({
      where: { id: row.id },
      data: { sections: normalizeSitePageSections(raw) },
    });
  }
}

export async function getSitePage(slug: string): Promise<SitePageData | null> {
  if (!(SITE_PAGE_SLUGS as readonly string[]).includes(slug)) return null;

  const key = slug as SitePageSlug;
  const fallback = DEFAULT_PAGES[key];

  if (!isDatabaseConfigured()) {
    return { ...fallback };
  }

  await ensureSitePagesInDb();

  const row = await prisma.sitePage.findUnique({ where: { slug } });
  if (!row) return { ...fallback };

  const mapped = mapDbRow(row);
  if (mapped.sections.length === 0) {
    return { ...fallback, updatedAt: mapped.updatedAt };
  }
  return mapped;
}

export const getSitePageCached = cache(getSitePage);

export async function updateSitePage(
  slug: SitePageSlug,
  data: Partial<Pick<SitePageData, "title" | "subtitle" | "badge" | "sections">>
) {
  if (!isDatabaseConfigured()) return null;
  await ensureSitePagesInDb();
  return prisma.sitePage.update({
    where: { slug },
    data: {
      title: data.title,
      subtitle: data.subtitle,
      badge: data.badge,
      sections: data.sections,
    },
  });
}
