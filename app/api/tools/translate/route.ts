import { NextResponse } from "next/server";
import { callGeminiText, isGeminiConfigured } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

type Body = {
  text?: string;
  langpair?: "en|hi" | "hi|en";
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.text || "").trim().slice(0, 1500);
  const langpair = body.langpair === "hi|en" ? "hi|en" : "en|hi";
  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  // 1) MyMemory free API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const json = (await res.json()) as {
        responseData?: { translatedText?: string };
        responseStatus?: number;
      };
      const translated = json.responseData?.translatedText?.trim();
      if (translated && json.responseStatus === 200) {
        return NextResponse.json({ translation: translated, source: "mymemory" });
      }
    }
  } catch {
    /* fall through */
  }

  // 2) Gemini fallback when configured
  if (isGeminiConfigured()) {
    const from = langpair === "en|hi" ? "English" : "Hindi";
    const to = langpair === "en|hi" ? "Hindi" : "English";
    const ai = await callGeminiText(
      `You are a precise ${from}-to-${to} translator for Indian users. Return ONLY the translation — no quotes, no explanation.`,
      text,
      800
    );
    if (ai?.trim()) {
      return NextResponse.json({ translation: ai.trim(), source: "gemini" });
    }
  }

  return NextResponse.json(
    { error: "Translation service unavailable. Try again shortly." },
    { status: 503 }
  );
}
