import { NextResponse } from "next/server";
import { callGeminiText, isGeminiConfigured } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

type Body = {
  text?: string;
  langpair?: "en|hi" | "hi|en";
};

function normalizePair(langpair: string): "en|hi" | "hi|en" {
  return langpair === "hi|en" ? "hi|en" : "en|hi";
}

/** MyMemory prefers regional tags for India. */
function mymemoryPair(langpair: "en|hi" | "hi|en") {
  return langpair === "hi|en" ? "hi-IN|en-GB" : "en-GB|hi-IN";
}

function isUsableTranslation(text: string, source: string) {
  const t = text.trim();
  if (!t) return false;
  if (/MYMEMORY WARNING/i.test(t)) return false;
  // Reject echo of the source when clearly untranslated English↔English
  if (t.toLowerCase() === source.trim().toLowerCase() && /^[\x00-\x7F]+$/.test(t)) {
    return false;
  }
  return true;
}

async function translateMyMemory(
  text: string,
  langpair: "en|hi" | "hi|en"
): Promise<string | null> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(mymemoryPair(langpair))}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(7000),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number | string;
  };
  const status = Number(json.responseStatus);
  const translated = json.responseData?.translatedText?.trim();
  if (!translated) return null;
  if (status && status !== 200) return null;
  if (!isUsableTranslation(translated, text)) return null;
  return translated;
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.text || "").trim().slice(0, 1500);
  const langpair = normalizePair(body.langpair || "en|hi");
  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  try {
    const mm = await translateMyMemory(text, langpair);
    if (mm) {
      return NextResponse.json({ translation: mm, source: "mymemory" });
    }
  } catch {
    /* fall through */
  }

  if (isGeminiConfigured()) {
    const from = langpair === "en|hi" ? "English" : "Hindi";
    const to = langpair === "en|hi" ? "Hindi" : "English";
    const ai = await withTimeout(
      callGeminiText(
        `You are a precise ${from}-to-${to} translator for Indian users. Return ONLY the translation — no quotes, no explanation, no romanization unless the target is English.`,
        text,
        800
      ),
      4000
    );
    if (ai && isUsableTranslation(ai, text)) {
      return NextResponse.json({ translation: ai.trim(), source: "gemini" });
    }
  }

  return NextResponse.json(
    { error: "Translation service unavailable. Try again in a moment." },
    { status: 503 }
  );
}
