import { isGeminiConfigured } from "@/lib/ai/gemini";

export type ModerationResult = {
  safe: boolean;
  reason?: string;
};

/** Quick caption pre-filter before AI check. */
const CAPTION_BLOCKLIST = [
  "porn",
  "porno",
  "xxx",
  "nude",
  "nudes",
  "naked",
  "nsfw",
  "onlyfans",
  "sex tape",
  "blowjob",
  "handjob",
  "cumshot",
  "hentai",
  "erotic",
  "stripper",
  "escort",
  "prostitut",
  "orgasm",
  "masturbat",
  "dildo",
  "vibrator",
  "fetish",
  "bdsm",
  "anal sex",
  "oral sex",
];

function captionFlagged(caption: string): string | null {
  const lower = caption.toLowerCase();
  for (const term of CAPTION_BLOCKLIST) {
    if (lower.includes(term)) {
      return `Caption contains prohibited term: "${term}"`;
    }
  }
  return null;
}

async function fetchImageBase64(
  url: string
): Promise<{ mimeType: string; data: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12_000), cache: "no-store" });
    if (!res.ok) return null;
    const mimeType = (res.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
    if (!mimeType.startsWith("image/")) return null;
    const data = Buffer.from(await res.arrayBuffer()).toString("base64");
    return { mimeType, data };
  } catch {
    return null;
  }
}

async function geminiModerationCheck(
  caption: string,
  imageUrl: string
): Promise<ModerationResult | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;

  const image = await fetchImageBase64(imageUrl);
  if (!image) return null;

  const model = process.env.GEMINI_TEXT_MODEL?.trim() || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text:
              "You are a content moderator for a family-friendly social platform. " +
              "Flag content that is sexual, pornographic, or explicit adult content: nudity meant to arouse, sexual acts, explicit sexual posing, or graphic sexual language. " +
              "Do NOT flag normal fashion, swimwear in non-sexual context, art, or mild romance. " +
              "Respond with JSON only.",
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Caption: "${caption.slice(0, 500)}"\n\nDoes this reel contain sexual or explicit adult content?`,
            },
            { inlineData: { mimeType: image.mimeType, data: image.data } },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 256,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            sexual: { type: "boolean" },
            reason: { type: "string" },
          },
          required: ["sexual", "reason"],
        },
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[reel moderation]", res.status, await res.text().catch(() => ""));
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
    const parsed = JSON.parse(text) as { sexual?: boolean; reason?: string };
    if (parsed.sexual) {
      return { safe: false, reason: parsed.reason || "Sexual content detected" };
    }
    return { safe: true };
  } catch {
    console.error("[reel moderation] parse failed", text.slice(0, 200));
    return null;
  }
}

/**
 * Auto-moderate reel content. Safe reels publish instantly; flagged reels go to PENDING.
 * If Gemini is unavailable, fail open (publish) so normal uploads are not blocked.
 */
export async function moderateReelContent(input: {
  caption: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: "IMAGE" | "VIDEO";
}): Promise<ModerationResult> {
  const captionHit = captionFlagged(input.caption);
  if (captionHit) return { safe: false, reason: captionHit };

  if (!isGeminiConfigured()) return { safe: true };

  const visionUrl =
    input.mediaType === "IMAGE" ? input.mediaUrl : input.thumbnailUrl || input.mediaUrl;

  try {
    const ai = await geminiModerationCheck(input.caption, visionUrl);
    if (ai) return ai;
  } catch (err) {
    console.error("[reel moderation]", err);
  }

  return { safe: true };
}
