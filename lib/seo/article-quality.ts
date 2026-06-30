/** Quality gates for AI / cron articles — AdSense-grade editorial bar. */

export const MIN_ARTICLE_WORDS = 800;
export const MIN_ARTICLE_CHARS = 3200;
export const MIN_READING_MINUTES = 4;
export const ARTICLE_TARGET_WORDS = { min: 800, max: 1100 } as const;

export function wordCount(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export function normalizeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Generic cron titles that should not repeat across days. */
export function isGenericDailyTitle(title: string): boolean {
  const t = title.toLowerCase();
  return (
    t.includes("what to know today") ||
    t.includes("what indian readers should know") ||
    /in india:.*today/i.test(t)
  );
}

export function extractSceneFromArticle(content: string, title: string): string {
  const headings = [...content.matchAll(/^##\s+(.+)$/gm)]
    .map((m) => m[1]?.trim())
    .filter(Boolean)
    .slice(0, 3);
  const body = content
    .replace(/^#+\s+.+$/gm, "")
    .replace(/[*_`>#-]/g, " ")
    .trim();
  const firstPara = body.split(/\n\n+/).find((p) => p.trim().length > 40)?.trim().slice(0, 220);
  return [title, ...headings, firstPara].filter(Boolean).join(". ");
}

export function coverPromptMatchesTitle(prompt: string, title: string): boolean {
  const significant = title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4 && !/^(india|indian|2026|guide|today|what|know)$/.test(w));
  if (!significant.length) return prompt.length >= 60;
  const p = prompt.toLowerCase();
  return significant.some((w) => p.includes(w));
}

export function scoreBlogForKeep(input: {
  views: number;
  readingTime: number;
  content: string;
  createdAt: Date;
}): number {
  const words = wordCount(input.content);
  return (
    input.views * 10 +
    input.readingTime * 100 +
    Math.min(words, 2000) +
    input.createdAt.getTime() / 1_000_000_000
  );
}

export function passesArticleQualityGate(content: string): boolean {
  const words = wordCount(content);
  return content.trim().length >= MIN_ARTICLE_CHARS && words >= MIN_ARTICLE_WORDS;
}
