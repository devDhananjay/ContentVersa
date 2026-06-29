import { callGeminiText, isGeminiConfigured } from "@/lib/ai/gemini";
import { searchBlogs } from "@/lib/data/blogs";
import { CATEGORIES } from "@/lib/data/categories";
import {
  defaultFallback,
  detectLocale,
  faqAnswer,
  looksLikeContentSearch,
  matchFaq,
  pickLocale,
  staticWelcome,
  type HelpLink,
} from "@/lib/help/chat-knowledge";
import { SITE_MAP_NAV } from "@/lib/data/site-map-tree";

export type HelpChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type HelpChatResult = {
  reply: string;
  source: "faq" | "search" | "gemini" | "local";
  links?: HelpLink[];
};

function extractSearchTerm(query: string): string {
  return query
    .replace(
      /^(show|find|search|latest|trending|articles?|blogs?|about|on|read|me|kuch|koi|dikhao|batao|par|ke bare)\s+/gi,
      ""
    )
    .replace(/\s+(articles?|blogs?|par|ke bare|mein|me)$/gi, "")
    .trim();
}

function buildSearchReply(
  query: string,
  locale: "en" | "hi"
): HelpChatResult | null {
  const term = extractSearchTerm(query);
  if (!term || term.length < 2) return null;

  const blogs = searchBlogs(term).slice(0, 4);
  const categories = CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(term.toLowerCase()) ||
      c.slug.toLowerCase().includes(term.toLowerCase())
  ).slice(0, 3);

  if (blogs.length === 0 && categories.length === 0) {
    if (/trending|latest|popular/.test(term.toLowerCase())) {
      return {
        reply:
          locale === "hi"
            ? "ट्रेंडिंग और latest blogs यहाँ browse करें:"
            : "Browse trending and latest blogs here:",
        source: "search",
        links: [{ label: "Explore blogs", href: "/blogs" }],
      };
    }
    return null;
  }

  const links: HelpLink[] = [
    ...blogs.map((b) => ({ label: b.title, href: `/blogs/${b.slug}` })),
    ...categories.map((c) => ({ label: c.name, href: `/categories/${c.slug}` })),
  ];

  if (locale === "hi") {
    const titles = blogs.map((b) => `• ${b.title}`).join("\n");
    return {
      reply: blogs.length
        ? `"${term}" से जुड़े लेख:\n${titles}\n\nनीचे links पर tap करें।`
        : `"${term}" category मिली — नीचे link खोलें।`,
      source: "search",
      links,
    };
  }

  const titles = blogs.map((b) => `• ${b.title}`).join("\n");
  return {
    reply: blogs.length
      ? `Articles matching "${term}":\n${titles}\n\nTap a link below to read.`
      : `Found categories for "${term}" — open a link below.`,
    source: "search",
    links,
  };
}

function helpSystemPrompt(pagePath: string | undefined, locale: "en" | "hi") {
  const nav = SITE_MAP_NAV.links.map((l) => `${l.label}: ${l.href}`).join(", ");
  const langRule =
    locale === "hi"
      ? "CRITICAL: Reply ONLY in Hindi (Devanagari script). Do not write English sentences — proper nouns like ContentVerse are fine."
      : "CRITICAL: Reply ONLY in English. Do not use Hindi or Devanagari script.";
  return `You are ContentVerse Help — a short, friendly site assistant (NOT a generic chatbot).
Answer ONLY about ContentVerse: blogs, reels, sports, finance, jobs, creator dashboard, premium (₹199/mo), newsletter (opt-in only), contact.
Keep replies under 120 words. Use bullet points when listing steps.
${langRule}
Never invent features. If unsure, suggest /contact or /site-map.
Current page path: ${pagePath || "/"}
Key links: ${nav}, /dashboard/create, /premium, /leaderboard, /site-map, /contact`;
}

async function askGemini(
  message: string,
  history: HelpChatMessage[],
  pagePath: string | undefined,
  locale: "en" | "hi"
): Promise<string | null> {
  if (!isGeminiConfigured()) return null;

  const recent = history.slice(-4);
  const transcript = recent
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const user = transcript
    ? `${transcript}\nUser: ${message}`
    : message;

  return callGeminiText(helpSystemPrompt(pagePath, locale), user, 320);
}

const WELCOME_GEMINI_SYSTEM = `You are ContentVerse Help greeting a new website visitor.
Write a warm welcome in 2-3 short paragraphs (max 90 words total).
Briefly say you help with blogs, reels, finance, sports, jobs, and writing on ContentVerse.
End by inviting them to subscribe to the free weekly newsletter (opt-in only, unsubscribe anytime).
No markdown headers. You may use **bold** sparingly. Do not invent features.`;

export async function generateWelcomeMessage(
  locale: "en" | "hi" = "en",
  pagePath?: string
): Promise<HelpChatResult> {
  const fallback = staticWelcome(locale);

  if (isGeminiConfigured()) {
    const prompt =
      locale === "hi"
        ? "नए visitor को ContentVerse पर स्वागत करो। Hello और Namaste दोनों बोलो। पूरा जवाब हिंदी (देवनागरी) में लिखो।"
        : "Greet a new visitor landing on ContentVerse. Start with Hello! Write the entire reply in English only.";
    const system =
      locale === "hi"
        ? `${WELCOME_GEMINI_SYSTEM}\nCRITICAL: Write ONLY in Hindi (Devanagari). Start with Hello! and Namaste!`
        : `${WELCOME_GEMINI_SYSTEM}\nCRITICAL: Write ONLY in English. You may say Namaste once as a greeting.`;
    const ai = await callGeminiText(
      `${system}\nPage: ${pagePath || "/"}`,
      prompt,
      400
    );
    if (ai && ai.length >= 80) {
      return {
        reply: ai,
        source: "gemini",
        links: fallback.links,
      };
    }
  }

  return { reply: fallback.reply, source: "local", links: fallback.links };
}

export async function respondToHelpChat(opts: {
  message: string;
  history?: HelpChatMessage[];
  pagePath?: string;
  locale?: "en" | "hi";
  welcome?: boolean;
}): Promise<HelpChatResult> {
  if (opts.welcome) {
    const welcomeLocale = opts.locale ?? "en";
    return generateWelcomeMessage(welcomeLocale, opts.pagePath);
  }

  const message = opts.message.trim();
  if (!message) {
    const locale = pickLocale("", opts.locale);
    const fb = defaultFallback(locale);
    return { reply: fb.reply, source: "local", links: fb.links };
  }

  const locale = detectLocale(message);

  if (looksLikeContentSearch(message)) {
    const search = buildSearchReply(message, locale);
    if (search) return search;
  }

  const faq = matchFaq(message);
  if (faq) {
    return {
      reply: faqAnswer(faq.entry, locale),
      source: "faq",
      links: faq.entry.links,
    };
  }

  const ai = await askGemini(message, opts.history ?? [], opts.pagePath, locale);
  if (ai) {
    return { reply: ai, source: "gemini" };
  }

  const fb = defaultFallback(locale);
  return { reply: fb.reply, source: "local", links: fb.links };
}
