/**
 * Google Gemini API — text + image generation.
 * Set GEMINI_API_KEY in .env (from Google AI Studio).
 */

const GEMINI_TEXT_MODEL =
  process.env.GEMINI_TEXT_MODEL?.trim() || "gemini-2.5-flash";
const GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-2.0-flash-exp";

function apiKey() {
  return process.env.GEMINI_API_KEY?.trim() || "";
}

export function isGeminiConfigured() {
  return Boolean(apiKey());
}

export async function callGeminiText(
  system: string,
  user: string,
  maxTokens = 512
): Promise<string | null> {
  const key = apiKey();
  if (!key) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user.slice(0, 14000) }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.6,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[gemini text]", res.status, await res.text().catch(() => ""));
    return null;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();
  return text || null;
}

/** Structured JSON via Gemini response schema (2.5+). */
export async function callGeminiJson<T>(
  system: string,
  user: string,
  responseSchema: object,
  maxTokens = 8192
): Promise<T | null> {
  const key = apiKey();
  if (!key) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user.slice(0, 14000) }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[gemini json]", res.status, await res.text().catch(() => ""));
    return null;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error("[gemini json] parse failed", text.slice(0, 200));
    return null;
  }
}

/** Returns a data URL for generated image. */
export async function callGeminiImage(prompt: string): Promise<string | null> {
  const key = apiKey();
  if (!key) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a high-quality blog cover illustration. No text in the image. Prompt: ${prompt.slice(0, 800)}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[gemini image]", res.status, await res.text().catch(() => ""));
    return null;
  }

  const data = (await res.json()) as {
    candidates?: {
      content?: {
        parts?: { inlineData?: { mimeType?: string; data?: string } }[];
      };
    }[];
  };

  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      const mime = part.inlineData.mimeType || "image/png";
      return `data:${mime};base64,${part.inlineData.data}`;
    }
  }

  return null;
}
