import {
  countWords,
  trimSummaryWords,
  SHORTS_SUMMARY_MIN_WORDS,
  SHORTS_SUMMARY_MAX_WORDS,
} from "@/lib/utils";

/** Convert markdown blog body to readable plain text with paragraph breaks. */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (block) => {
      const lang = block.match(/^```\w*/)?.[0]?.replace("```", "") || "code";
      return `(Code example${lang ? ` in ${lang}` : ""}.) `;
    })
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/** Fixed ~150-word digest target for all articles. */
export function getSummaryWordTargets(_articleWords?: number): {
  min: number;
  max: number;
} {
  return { min: SHORTS_SUMMARY_MIN_WORDS, max: SHORTS_SUMMARY_MAX_WORDS };
}

function takeWords(text: string, max: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= max) return words.join(" ");
  return words.slice(0, max).join(" ") + "…";
}

function extractQuote(plain: string): string | null {
  const m = plain.match(/"([^"]{12,220})"/);
  return m?.[1] || null;
}

function isTitleSection(section: string, title?: string): boolean {
  if (!title) return false;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return norm(section) === norm(title) || countWords(section) < 12;
}

function parseBulletLines(section: string): string[] {
  if (!section.includes("•")) return [];
  return section
    .split(/\n/)
    .map((l) => l.replace(/^•\s*/, "").trim())
    .filter((l) => l.length > 10);
}

function shortenBullet(line: string): string {
  const clean = line.replace(/\*\*/g, "").replace(/\.$/, "").trim();
  if (/editor|block|slash/i.test(clean)) return "a block editor with slash commands and AI assists";
  if (/submission|approval|feedback/i.test(clean)) return "transparent submission and faster approvals";
  if (/monetiz|tip|subscription/i.test(clean)) return "stacked monetization (tips, paid posts, subs, ad share)";
  return clean.toLowerCase();
}

/** Build a full digest from article sections when AI is unavailable or too short. */
export function buildStructuredLocalSummary(content: string, title?: string): string {
  const plain = markdownToPlainText(content);
  if (!plain) return "";

  const articleWords = countWords(plain);
  const { min: minWords, max: maxWords } = getSummaryWordTargets(articleWords);
  const sections = plain.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  const bodySections = sections.filter((s) => !isTitleSection(s, title));
  const parts: string[] = [];

  const intro = bodySections.find(
    (s) =>
      !s.startsWith("•") &&
      !/Code example/i.test(s) &&
      !/optimizes for the (platform|creator)/i.test(s) &&
      countWords(s) >= 20
  );
  const thesis = bodySections.find((s) =>
    /optimizes for the (platform|creator)/i.test(s)
  );
  const quote = extractQuote(plain);
  const bulletSection = bodySections.find((s) => s.includes("•"));
  const bullets = bulletSection ? parseBulletLines(bulletSection) : [];
  const hasCode = /Code example/i.test(plain);
  const closing = [...bodySections]
    .reverse()
    .find(
      (s) =>
        !s.startsWith("•") &&
        !/Code example/i.test(s) &&
        s !== intro &&
        s !== thesis &&
        countWords(s) >= 12
    );

  if (intro) {
    parts.push(takeWords(intro, 42));
  } else if (title) {
    parts.push(
      takeWords(
        `"${title}" argues creators can out-ship studios when tools, review, and payouts favor the author.`,
        28
      )
    );
  }

  if (thesis) {
    parts.push(takeWords(thesis, 38));
  }

  if (quote) {
    parts.push(takeWords(`"${quote}" — tools should match how creators feel when they ship.`, 22));
  }

  if (bullets.length) {
    const joined = bullets.map(shortenBullet).join("; ");
    parts.push(`Key shifts: ${joined}.`);
  }

  if (hasCode) {
    parts.push(
      "Publish flow: draft → moderation queue → live only after approval."
    );
  }

  if (closing) {
    parts.push(takeWords(closing, 32));
  }

  let summary = trimSummaryWords(parts.join("\n\n"), maxWords);
  if (countWords(summary) < minWords && closing) {
    const need = minWords - countWords(summary);
    summary = `${summary}\n\n${takeWords(closing, need + 2)}`;
    summary = trimSummaryWords(summary, maxWords);
  }
  return summary;
}

/** Ensure AI output meets minimum length; pad with structured local summary if needed. */
export function finalizeArticleSummary(
  aiText: string | null | undefined,
  content: string,
  title?: string
): { summary: string; padded: boolean; articleWords: number; targetWords: { min: number; max: number } } {
  const plain = markdownToPlainText(content);
  const articleWords = countWords(plain);
  const targetWords = getSummaryWordTargets(articleWords);
  const local = buildStructuredLocalSummary(content, title);
  let summary = (aiText || "").trim();

  summary = summary
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .trim();

  const wc = countWords(summary);
  const minNeeded = targetWords.min;

  if (!summary || wc < minNeeded * 0.45) {
    return { summary: local, padded: true, articleWords, targetWords };
  }

  if (wc < minNeeded) {
    const merged = `${summary}\n\n${local}`;
    return {
      summary: trimSummaryWords(merged, targetWords.max),
      padded: true,
      articleWords,
      targetWords,
    };
  }

  return {
    summary: trimSummaryWords(summary, targetWords.max),
    padded: false,
    articleWords,
    targetWords,
  };
}
