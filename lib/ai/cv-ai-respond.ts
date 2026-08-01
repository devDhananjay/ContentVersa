import { callGeminiText, isGeminiConfigured } from "@/lib/ai/gemini";
import { SITE } from "@/lib/seo";
import {
  CV_AI_MODES,
  getCvAiMode,
  type CvAiModeId,
} from "@/lib/ai/cv-ai-modes";

export type CvAiMessage = { role: "user" | "assistant"; content: string };

export type CvAiChatResult = {
  reply: string;
  source: "gemini" | "local";
  links?: { label: string; href: string }[];
};

const MODE_LINKS: Partial<Record<CvAiModeId, { label: string; href: string }[]>> = {
  finance: [
    { label: "EMI calculator", href: "/tools/emi-calculator" },
    { label: "SIP calculator", href: "/tools/sip-calculator" },
    { label: "FD calculator", href: "/tools/fd-calculator" },
    { label: "Salary tax calculator", href: "/tools/salary-tax-calculator" },
    { label: "MoneyVerse guides", href: "/finance#money-guides" },
  ],
  resume: [
    { label: "Browse jobs", href: "/jobs" },
    { label: "Govt jobs", href: "/jobs/govt" },
    { label: "Career guides", href: "/guides/jobs" },
  ],
  pdf: [
    { label: "Bank Statement Analyzer", href: "/moneyverse/bank-statement-analyzer" },
    { label: "Merge PDF", href: "/tools/merge-pdf" },
    { label: "Compress PDF", href: "/tools/compress-pdf" },
  ],
  summarize: [{ label: "Read blogs", href: "/blogs" }],
  "bank-statement": [
    { label: "Open Bank Statement Analyzer", href: "/moneyverse/bank-statement-analyzer" },
  ],
  screenshot: [
    { label: "Open Screenshot Scan", href: "/moneyverse/screenshot-scan" },
  ],
};

function systemForMode(modeId: CvAiModeId): string {
  const mode = getCvAiMode(modeId);
  const base = `You are ContentVerse India AI on ${SITE.name} (${SITE.url}).
Product: ContentVerse India AI — helpful India-first assistant (not financial/legal advice).
Be clear, practical, and concise. Use short paragraphs or bullets.
You may reply in English or Hindi to match the user.
Never invent ContentVerse India features that do not exist.
Available modes: ${CV_AI_MODES.map((m) => m.id).join(", ")}.
Current mode: ${mode.id} — ${mode.title}.`;

  switch (modeId) {
    case "summarize":
      return `${base}
Task: Summarise the user's pasted text.
Return: (1) 3–6 bullet key points (2) a 2–4 sentence plain summary.
If text is too short, ask for more content. Do not invent facts.`;
    case "explain":
      return `${base}
Task: Explain the topic or pasted text in simple language (class 10 level).
Use everyday India examples. Avoid jargon; if you must use a term, define it.`;
    case "compare":
      return `${base}
Task: Compare the two (or more) things the user named.
Structure: Quick verdict → Side-by-side bullets (pros/cons) → Who should pick what.
Stay neutral; no paid product shilling.`;
    case "resume":
      return `${base}
Task: Draft a clean India job resume from the user's details.
Output plain text sections: Name/Contact | Summary | Skills | Experience | Education | Projects (if any).
Use strong action verbs. Keep it honest — do not invent employers or degrees.
End with 2 short tips to improve the draft.`;
    case "finance":
      return `${base}
Task: Help with personal-finance calculations and planning in India.
Show formulas and step-by-step maths when useful. Round to ₹ sensibly.
Always say estimates are illustrative — not advice.
Point users to ContentVerse India calculators when exact UI tools help (EMI, SIP, FD, tax).`;
    case "pdf":
      return `${base}
Task: Analyse pasted PDF/document text.
Extract: purpose, key clauses/numbers, risks, and a short action checklist.
If it looks like a bank statement, tell them to use /moneyverse/bank-statement-analyzer for income/expense totals.`;
    case "bank-statement":
      return `${base}
Tell the user to open Bank Statement Analyzer for PDF upload.
Explain outputs: Total Income, Total Expense, Top Spending Category, Monthly Average, Subscription Detection.`;
    case "screenshot":
      return `${base}
Tell the user to open Screenshot Scan (OCR) for UPI payment images.
Explain it extracts amount, merchant/payee and category into MoneyVerse.`;
    case "ask":
    default:
      return `${base}
Task: Answer helpfully about general questions and ContentVerse India products
(MoneyVerse, CineVerse, GoldVerse, Finance, Sports, Jobs, Tools).
Keep answers under ~180 words unless the user asks for depth.`;
  }
}

function localFallback(modeId: CvAiModeId, message: string): string {
  const mode = getCvAiMode(modeId);
  if (mode.kind === "tool" && mode.toolHref) {
    return `Open **${mode.title}** here: ${mode.toolHref}\n\n${mode.description}`;
  }
  if (modeId === "resume") {
    return `Share your name, target role, city, education, skills and experience bullets — ContentVerse India AI will draft a resume.\n\nYou wrote:\n${message.slice(0, 400)}`;
  }
  if (modeId === "summarize") {
    return `Paste a longer article for a better summary. Tip: open any ContentVerse India blog and use News in 60 for on-page summaries.`;
  }
  if (modeId === "finance") {
    return `Try our free calculators while AI is warming up:\n• EMI → /tools/emi-calculator\n• SIP → /tools/sip-calculator\n• FD → /tools/fd-calculator\n• Tax → /tools/salary-tax-calculator`;
  }
  return `ContentVerse India AI is ready for **${mode.title}**. ${mode.description}\n\nTry again in a moment, or browse /ai for all modes.`;
}

export async function respondToCvAiChat(input: {
  message: string;
  mode?: string;
  history?: CvAiMessage[];
}): Promise<CvAiChatResult> {
  const mode = getCvAiMode(input.mode);
  const message = input.message.trim().slice(0, 12000);
  const links = MODE_LINKS[mode.id];

  if (mode.kind === "tool") {
    return {
      reply: localFallback(mode.id, message),
      source: "local",
      links,
    };
  }

  if (!message) {
    return {
      reply: `You're on **${mode.title}**. ${mode.description}\n\n${mode.examples.map((e) => `• ${e}`).join("\n")}`,
      source: "local",
      links,
    };
  }

  if (isGeminiConfigured()) {
    const history = (input.history ?? []).slice(-8);
    const transcript = history
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");
    const userBlock = transcript
      ? `${transcript}\nUser: ${message}`
      : message;

    const text = await callGeminiText(systemForMode(mode.id), userBlock, 1200);
    if (text?.trim()) {
      return { reply: text.trim(), source: "gemini", links };
    }
  }

  return {
    reply: localFallback(mode.id, message),
    source: "local",
    links,
  };
}
