/**
 * Google Gemini API — text + image generation.
 * Set GEMINI_API_KEY in .env (from Google AI Studio).
 */

const GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-2.0-flash-exp";

export type GeminiFailure = {
  status: number;
  quotaExceeded: boolean;
  message: string;
};

function apiKey() {
  return process.env.GEMINI_API_KEY?.trim() || "";
}

export function isGeminiConfigured() {
  return Boolean(apiKey());
}

function textModels(): string[] {
  const configured = process.env.GEMINI_TEXT_MODEL?.trim();
  const chain = [
    configured,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
  ].filter((m): m is string => Boolean(m));
  return [...new Set(chain)];
}

function parseGeminiFailure(status: number, body: string): GeminiFailure {
  let message = `Gemini API error (${status})`;
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string };
    };
    if (parsed.error?.message) message = parsed.error.message;
  } catch {
    if (body) message = body.slice(0, 280);
  }
  const quotaExceeded =
    status === 429 ||
    /quota|RESOURCE_EXHAUSTED|rate.?limit/i.test(message);
  return { status, quotaExceeded, message };
}

async function geminiGenerate(
  model: string,
  body: object
): Promise<
  | { ok: true; data: { candidates?: { content?: { parts?: { text?: string }[] } }[] } }
  | { ok: false; failure: GeminiFailure }
> {
  const key = apiKey();
  if (!key) {
    return {
      ok: false,
      failure: {
        status: 503,
        quotaExceeded: false,
        message: "GEMINI_API_KEY not configured",
      },
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const post = async () => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await res.text().catch(() => "");
    return { res, text };
  };

  let { res, text } = await post();

  if (res.status === 429) {
    const retrySec = Number(text.match(/retry in ([\d.]+)s/i)?.[1] ?? 10);
    await new Promise((r) =>
      setTimeout(r, Math.min(retrySec * 1000, 20000))
    );
    ({ res, text } = await post());
  }

  if (!res.ok) {
    console.error(`[gemini ${model}]`, res.status, text.slice(0, 400));
    return { ok: false, failure: parseGeminiFailure(res.status, text) };
  }

  try {
    return {
      ok: true,
      data: JSON.parse(text) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      },
    };
  } catch {
    return {
      ok: false,
      failure: {
        status: 500,
        quotaExceeded: false,
        message: "Invalid Gemini response",
      },
    };
  }
}

function extractText(data: {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}): string | null {
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();
  return text || null;
}

async function generateAcrossModels(
  buildBody: (model: string) => object
): Promise<
  | { ok: true; text: string; model: string }
  | { ok: false; failure: GeminiFailure }
> {
  const models = textModels();
  let lastFailure: GeminiFailure = {
    status: 503,
    quotaExceeded: false,
    message: "No Gemini text models configured",
  };

  for (const model of models) {
    const result = await geminiGenerate(model, buildBody(model));
    if (!result.ok) {
      lastFailure = result.failure;
      if (result.failure.quotaExceeded) continue;
      continue;
    }
    const text = extractText(result.data);
    if (text) return { ok: true, text, model };
  }

  return { ok: false, failure: lastFailure };
}

export async function callGeminiText(
  system: string,
  user: string,
  maxTokens = 512
): Promise<string | null> {
  const result = await generateAcrossModels(() => ({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user.slice(0, 14000) }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.6,
    },
  }));

  return result.ok ? result.text : null;
}

/** Structured JSON via Gemini response schema (2.5+). */
export async function callGeminiJson<T>(
  system: string,
  user: string,
  responseSchema: object,
  maxTokens = 8192
): Promise<T | null> {
  const result = await generateAcrossModels(() => ({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user.slice(0, 14000) }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema,
    },
  }));

  if (!result.ok) return null;

  try {
    return JSON.parse(result.text) as T;
  } catch {
    console.error("[gemini json] parse failed", result.text.slice(0, 200));
    return null;
  }
}

export async function callGeminiJsonWithMeta<T>(
  system: string,
  user: string,
  responseSchema: object,
  maxTokens = 8192
): Promise<
  | { ok: true; data: T; model: string }
  | { ok: false; failure: GeminiFailure }
> {
  const result = await generateAcrossModels(() => ({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user.slice(0, 14000) }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema,
    },
  }));

  if (!result.ok) return result;

  try {
    return { ok: true, data: JSON.parse(result.text) as T, model: result.model };
  } catch {
    return {
      ok: false,
      failure: {
        status: 500,
        quotaExceeded: false,
        message: "Gemini returned invalid JSON",
      },
    };
  }
}

export async function callGeminiTextWithMeta(
  system: string,
  user: string,
  maxTokens = 8192
): Promise<
  | { ok: true; text: string; model: string }
  | { ok: false; failure: GeminiFailure }
> {
  return generateAcrossModels(() => ({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user.slice(0, 14000) }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.6,
    },
  }));
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
              text: [
                "Create a single photorealistic editorial photograph for a blog hero banner (16:9 wide shot).",
                "Match the scene description exactly — do not substitute a generic category image.",
                "No text, logos, watermarks, borders, or collage.",
                `Scene: ${prompt.slice(0, 900)}`,
              ].join(" "),
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
