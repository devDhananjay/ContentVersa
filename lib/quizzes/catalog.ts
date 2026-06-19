export type QuizOption = {
  id: string;
  label: string;
};

export type DailyQuiz = {
  key: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  category: string;
};

export const QUIZ_BANK: DailyQuiz[] = [
  {
    key: "ai-token-basics",
    question: "What does a large language model primarily predict next?",
    options: [
      { id: "a", label: "The next token in a sequence" },
      { id: "b", label: "Tomorrow's stock price" },
      { id: "c", label: "A user's password" },
      { id: "d", label: "Server CPU temperature" },
    ],
    correctOptionId: "a",
    explanation: "LLMs are trained to predict the most likely next token given prior context.",
    category: "AI",
  },
  {
    key: "seo-canonical",
    question: "A canonical URL mainly helps search engines with…",
    options: [
      { id: "a", label: "Duplicate content signals" },
      { id: "b", label: "Image compression" },
      { id: "c", label: "Email deliverability" },
      { id: "d", label: "Payment gateway routing" },
    ],
    correctOptionId: "a",
    explanation: "Canonical tags tell crawlers which URL is the preferred version of a page.",
    category: "SEO",
  },
  {
    key: "creator-streak",
    question: "On ContentVerse, reading streaks count when you…",
    options: [
      { id: "a", label: "Read at least ~60s or 30% progress in a day" },
      { id: "b", label: "Open the homepage once" },
      { id: "c", label: "Share on WhatsApp only" },
      { id: "d", label: "Publish 10 articles daily" },
    ],
    correctOptionId: "a",
    explanation: "Streaks reward genuine reading time or meaningful scroll depth.",
    category: "ContentVerse",
  },
  {
    key: "india-upi",
    question: "UPI payments in India are typically settled through…",
    options: [
      { id: "a", label: "NPCI's real-time rail" },
      { id: "b", label: "Postal money orders" },
      { id: "c", label: "SWIFT wire transfers only" },
      { id: "d", label: "Cheque clearing houses" },
    ],
    correctOptionId: "a",
    explanation: "UPI runs on NPCI infrastructure for instant bank-to-bank transfers.",
    category: "Finance",
  },
  {
    key: "cricket-ipl",
    question: "In T20 cricket, how many overs does each side bowl?",
    options: [
      { id: "a", label: "20" },
      { id: "b", label: "50" },
      { id: "c", label: "10" },
      { id: "d", label: "15" },
    ],
    correctOptionId: "a",
    explanation: "T20 = Twenty20 — 20 overs per innings.",
    category: "Sports",
  },
  {
    key: "newsletter-growth",
    question: "Best practice for newsletter growth is usually…",
    options: [
      { id: "a", label: "Consistent value + clear subscribe CTA" },
      { id: "b", label: "Buy email lists in bulk" },
      { id: "c", label: "Hide the unsubscribe link" },
      { id: "d", label: "Send only once a year" },
    ],
    correctOptionId: "a",
    explanation: "Permission-based, valuable content beats shortcuts.",
    category: "Marketing",
  },
  {
    key: "react-server",
    question: "In Next.js App Router, Server Components render…",
    options: [
      { id: "a", label: "On the server by default" },
      { id: "b", label: "Only inside Web Workers" },
      { id: "c", label: "Exclusively on the CDN edge with no HTML" },
      { id: "d", label: "Only after every user clicks a button" },
    ],
    correctOptionId: "a",
    explanation: "App Router components are Server Components unless marked 'use client'.",
    category: "Tech",
  },
];
