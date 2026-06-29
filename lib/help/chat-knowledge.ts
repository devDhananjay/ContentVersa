export type HelpLink = { label: string; href: string };

export type HelpSuggestion = {
  label: string;
  labelHi: string;
  query?: string;
  href?: string;
};

export type HelpFaqEntry = {
  id: string;
  keywords: string[];
  answerEn: string;
  answerHi: string;
  links?: HelpLink[];
};

export const HELP_SUGGESTIONS: HelpSuggestion[] = [
  { label: "Explore blogs", labelHi: "ब्लॉग देखें", query: "show me trending blogs" },
  { label: "Write article", labelHi: "लेख लिखें", href: "/dashboard/create" },
  { label: "Stock alerts", labelHi: "स्टॉक अलर्ट", query: "how to set stock watchlist alerts" },
  { label: "Contact", labelHi: "संपर्क", href: "/contact" },
];

export const HELP_FAQ: HelpFaqEntry[] = [
  {
    id: "nav-finance",
    keywords: [
      "finance",
      "stock",
      "stocks",
      "nifty",
      "sensex",
      "watchlist",
      "market",
      "शेयर",
      "स्टॉक",
      "फाइनेंस",
      "निफ्टी",
    ],
    answerEn:
      "Open **Finance** from the top nav or visit /finance. Search tickers, build a watchlist, and turn on alerts when you're signed in.",
    answerHi:
      "ऊपर nav में **Finance** खोलें या /finance पर जाएँ। टिकर खोजें, watchlist बनाएँ, और sign in के बाद alerts चालू करें।",
    links: [
      { label: "Finance hub", href: "/finance" },
      { label: "Explore blogs", href: "/blogs" },
    ],
  },
  {
    id: "nav-reels",
    keywords: ["reel", "reels", "short video", "video", "रील", "वीडियो"],
    answerEn:
      "Browse reels at **/reels**. To create one, sign in → **Write** → **My reels** → **Create reel** (9:16 video).",
    answerHi:
      "**/reels** पर reels देखें। बनाने के लिए sign in करें → **Write** → **My reels** → **Create reel**।",
    links: [
      { label: "Reels feed", href: "/reels" },
      { label: "Create reel", href: "/dashboard/reels/create" },
    ],
  },
  {
    id: "creator-write",
    keywords: [
      "write",
      "publish",
      "article",
      "blog",
      "creator",
      "dashboard",
      "लेख",
      "लिख",
      "पब्लिश",
      "क्रिएटर",
    ],
    answerEn:
      "Sign in → **Write** or open **Dashboard → Create**. Draft with the block editor, use AI assist for SEO, then submit for review.",
    answerHi:
      "Sign in करें → **Write** या **Dashboard → Create**। Editor में लिखें, SEO के लिए AI assist use करें, फिर review के लिए submit करें।",
    links: [
      { label: "Write article", href: "/dashboard/create" },
      { label: "Creator dashboard", href: "/dashboard" },
      { label: "Premium plans", href: "/premium" },
    ],
  },
  {
    id: "premium",
    keywords: ["premium", "pricing", "plan", "199", "499", "subscribe", "प्रीमियम", "प्लान", "कीमत"],
    answerEn:
      "Creator Premium is **₹199/month** — AI writing assist, SEO tools, analytics & more. See /premium or email writewith@contentverses.in",
    answerHi:
      "Creator Premium **₹199/महीना** है — AI assist, SEO, analytics आदि। /premium देखें या writewith@contentverses.in पर लिखें।",
    links: [{ label: "Premium page", href: "/premium" }],
  },
  {
    id: "newsletter",
    keywords: [
      "newsletter",
      "subscribe",
      "email updates",
      "weekly",
      "अनसब्सक्राइब",
      "न्यूज़लेटर",
      "सब्सक्राइब",
    ],
    answerEn:
      "Scroll to the newsletter section on the homepage or use the form below. We only email people who opt in. Unsubscribe anytime from the link in any email.",
    answerHi:
      "Homepage पर newsletter section में email दें — सिर्फ opt-in users को mail जाती है। किसी भी email में unsubscribe link मिलेगा।",
    links: [{ label: "Home newsletter", href: "/#newsletter" }],
  },
  {
    id: "unsubscribe",
    keywords: ["unsubscribe", "stop emails", "opt out", "अनसब्सक्राइब", "मेल बंद"],
    answerEn:
      "Use the **Unsubscribe** link in any ContentVerse email. If you need help, contact us at /contact with your email address.",
    answerHi:
      "किसी भी ContentVerse email में **Unsubscribe** link use करें। मदद चाहिए तो /contact पर अपना email भेजें।",
    links: [{ label: "Contact support", href: "/contact" }],
  },
  {
    id: "sports",
    keywords: ["sports", "cricket", "football", "match", "ipl", "खेल", "क्रिकेट"],
    answerEn:
      "Live scores, schedules & sports blogs are at **/sports**. Pick a sport tab and follow match updates.",
    answerHi:
      "**/sports** पर live scores, schedule और sports blogs मिलेंगे। Sport tab चुनकर match updates देखें।",
    links: [{ label: "Sports hub", href: "/sports" }],
  },
  {
    id: "jobs",
    keywords: ["job", "jobs", "career", "govt", "government", "नौकरी", "जॉब"],
    answerEn:
      "Browse **/jobs** for private listings and **/jobs/govt** for government vacancies. Filter by category and location.",
    answerHi:
      "**/jobs** पर private jobs और **/jobs/govt** पर सरकारी vacancies देखें। Category और location से filter करें।",
    links: [
      { label: "Jobs board", href: "/jobs" },
      { label: "Govt jobs", href: "/jobs/govt" },
    ],
  },
  {
    id: "account",
    keywords: ["sign in", "login", "account", "password", "profile", "लॉगिन", "अकाउंट"],
    answerEn:
      "Use **Sign in** (top right) for email or Google login. Manage profile & bookmarks from your avatar menu.",
    answerHi:
      "ऊपर दाएँ **Sign in** से email या Google login करें। Avatar menu से profile और bookmarks manage करें।",
    links: [
      { label: "Sign in", href: "/auth/sign-in" },
      { label: "Sign up", href: "/auth/sign-up" },
    ],
  },
  {
    id: "report",
    keywords: ["report", "abuse", "moderation", "complaint", "शिकायत", "रिपोर्ट"],
    answerEn:
      "Report content from the article/reel page or email us via **/contact** with the link and details. Our team reviews within 24–48 hours.",
    answerHi:
      "Article/reel page से report करें या **/contact** पर link और details भेजें। Team 24–48 घंटे में review करती है।",
    links: [{ label: "Contact / report", href: "/contact" }],
  },
  {
    id: "sitemap",
    keywords: ["sitemap", "site map", "modules", "features", "साइट मैप"],
    answerEn:
      "See every module & page on our visual **Site Map** at /site-map — all sections, creator tools & admin areas.",
    answerHi:
      "हर module और page के लिए visual **Site Map** देखें: /site-map",
    links: [{ label: "Site map", href: "/site-map" }],
  },
  {
    id: "quiz-streak",
    keywords: ["quiz", "streak", "challenge", "leaderboard", "points", "क्विज", "स्ट्रीक"],
    answerEn:
      "Try the **Daily Quiz** and reading streak on the homepage. Earn points and climb the **Leaderboard** at /leaderboard.",
    answerHi:
      "Homepage पर **Daily Quiz** और reading streak try करें। Points कमाएँ और **Leaderboard** (/leaderboard) पर चढ़ें।",
    links: [
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Home", href: "/#daily-quiz" },
    ],
  },
];

const SITE_LINKS: HelpLink[] = [
  { label: "Home", href: "/" },
  { label: "Blogs", href: "/blogs" },
  { label: "Reels", href: "/reels" },
  { label: "Sports", href: "/sports" },
  { label: "Finance", href: "/finance" },
  { label: "Jobs", href: "/jobs" },
  { label: "Site map", href: "/site-map" },
  { label: "Contact", href: "/contact" },
];

export function isHindiText(text: string) {
  return /[\u0900-\u097F]/.test(text);
}

const HINGLISH_RE =
  /\b(kya|kaise|kahan|kahin|mujhe|batao|dikhao|chahiye|karna|karo|hai|hain|nahi|nahin|ka|ki|ke|mein|me|par|se|ko|aur|koi|bata|madad|namaste|dhanyavad|shukriya|likh|lekh|kaise|krna|krdo|btao|btao)\b/i;

/** Detect reply language from the user's message (not UI toggle). */
export function detectLocale(text: string): "en" | "hi" {
  const t = text.trim();
  if (!t) return "en";
  if (isHindiText(t)) return "hi";
  if (HINGLISH_RE.test(t)) return "hi";
  return "en";
}

export function pickLocale(text: string, preferred?: "en" | "hi"): "en" | "hi" {
  if (text.trim()) return detectLocale(text);
  return preferred ?? "en";
}

export function faqAnswer(entry: HelpFaqEntry, locale: "en" | "hi") {
  return locale === "hi" ? entry.answerHi : entry.answerEn;
}

export function matchFaq(query: string): { entry: HelpFaqEntry; score: number } | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  let best: { entry: HelpFaqEntry; score: number } | null = null;

  for (const entry of HELP_FAQ) {
    let score = 0;
    for (const kw of entry.keywords) {
      const k = kw.toLowerCase();
      if (q.includes(k) || k.includes(q)) score += k.length >= 4 ? 3 : 1;
    }
    if (entry.id.replace(/-/g, " ").split(" ").some((w) => q.includes(w))) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }

  return best && best.score >= 2 ? best : null;
}

export function looksLikeContentSearch(query: string) {
  const q = query.toLowerCase();
  return (
    /article|blog|read|find|search|show|latest|trending|about|on|par|ke bare|खोज|दिखाओ|लेख/.test(q) ||
    q.split(/\s+/).length <= 4
  );
}

export function defaultFallback(locale: "en" | "hi") {
  if (locale === "hi") {
    return {
      reply:
        "मैं ContentVerse सहायक हूँ। ऊपर quick buttons try करें या Finance, Reels, लेख लिखना, Premium जैसा सवाल पूछें।",
      links: SITE_LINKS.slice(0, 5),
    };
  }
  return {
    reply:
      "I'm the ContentVerse helper. Try the quick buttons above or ask about Finance, Reels, writing, Premium, or newsletter.",
    links: SITE_LINKS.slice(0, 5),
  };
}

export function staticWelcome(locale: "en" | "hi") {
  if (locale === "hi") {
    return {
      reply:
        "Hello! **नमस्ते!** 🙏 ContentVerse में आपका स्वागत है।\n\nमैं आपका site guide हूँ — blogs, reels, finance, jobs या लेख लिखने में मदद करूँगा।\n\n📬 **Newsletter:** हर हफ़्ते trending reads पाने के लिए नीचे email दें (सिर्फ opt-in, कभी भी unsubscribe)।",
      links: [
        { label: "Newsletter subscribe", href: "/#newsletter" },
        { label: "Explore blogs", href: "/blogs" },
        { label: "Site map", href: "/site-map" },
      ],
    };
  }
  return {
    reply:
      "Hello! **Namaste!** 🙏 Welcome to ContentVerse.\n\nI'm your site guide — ask me about blogs, reels, finance, jobs, or how to start writing.\n\n📬 **Newsletter:** Get weekly trending reads & creator picks — opt in below (unsubscribe anytime).",
    links: [
      { label: "Newsletter section", href: "/#newsletter" },
      { label: "Explore blogs", href: "/blogs" },
      { label: "Site map", href: "/site-map" },
    ],
  };
}
