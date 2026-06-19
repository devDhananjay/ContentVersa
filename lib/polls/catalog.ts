export type DailyPollDef = {
  slug: string;
  question: string;
  options: string[];
};

/** Homepage rotating polls — auto-created in DB on first request. */
export const DAILY_POLL_CATALOG: DailyPollDef[] = [
  {
    slug: "ai-replace-jobs",
    question: "Do you think AI will replace most creative jobs by 2030?",
    options: ["Yes", "No", "Maybe", "Only parts of the work"],
  },
  {
    slug: "best-creator-tool-2026",
    question: "Best tool for creators in 2026?",
    options: ["ChatGPT", "Canva", "Notion", "ContentVerse"],
  },
  {
    slug: "india-startup-bet",
    question: "Which sector will produce India's next big startup?",
    options: ["AI / SaaS", "Fintech", "D2C / Commerce", "Climate / Agri"],
  },
  {
    slug: "cricket-format-pick",
    question: "Your favourite cricket format?",
    options: ["T20", "ODI", "Test", "The Hundred"],
  },
  {
    slug: "newsletter-worth-it",
    question: "Do you read email newsletters weekly?",
    options: ["Yes, several", "One or two", "Rarely", "Never"],
  },
  {
    slug: "remote-work-india",
    question: "Remote work in India — where are you in 2026?",
    options: ["Fully remote", "Hybrid", "Office only", "Freelance / creator"],
  },
];

export const DAILY_POLL_SLUGS = DAILY_POLL_CATALOG.map((p) => p.slug);

export function getPollDefBySlug(slug: string): DailyPollDef | undefined {
  return DAILY_POLL_CATALOG.find((p) => p.slug === slug);
}
