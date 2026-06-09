import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined): string {
  const n = value ?? 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatCurrency(value: number, currency = "INR"): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Shorthand for Indian rupee display */
export function formatINR(value: number): string {
  return formatCurrency(value, "INR");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

/** Tagline only — "News in 60 words" (slogan unchanged). */
export const SHORTS_SLOGAN_WORDS = 60;

/** @deprecated Use SHORTS_SLOGAN_WORDS for display */
export const SHORTS_WORD_TARGET = SHORTS_SLOGAN_WORDS;

/** Full blog summary length (words) — slogan stays "News in 60 words" */
export const SHORTS_SUMMARY_MIN_WORDS = 150;
export const SHORTS_SUMMARY_MAX_WORDS = 150;

/** @deprecated Use word-based summary */
export const SHORTS_SUMMARY_MAX_CHARS = 1200;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function trimToCharCount(text: string, maxChars = 1200): string {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= maxChars) return s;
  const cut = s.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > maxChars * 0.6) return cut.slice(0, lastSpace).trim() + "…";
  return cut.trim() + "…";
}

/** Trim summary to max words while keeping paragraph breaks. */
export function trimSummaryWords(
  text: string,
  maxWords = SHORTS_SUMMARY_MAX_WORDS
): string {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const paragraphs = normalized.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  if (paragraphs.length > 1) {
    const kept: string[] = [];
    let used = 0;
    for (const para of paragraphs) {
      const w = countWords(para);
      if (used + w > maxWords && used > 0) {
        const room = maxWords - used;
        if (room >= 8) {
          const slice = para.split(/\s+/).filter(Boolean).slice(0, room).join(" ");
          kept.push(slice + (room < w ? "…" : ""));
        }
        break;
      }
      kept.push(para);
      used += w;
      if (used >= maxWords) break;
    }
    if (kept.length) return kept.join("\n\n");
  }

  const words = normalized.replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return words.slice(0, maxWords).join(" ") + "…";
}

export function trimToWordCount(text: string, maxWords = SHORTS_SLOGAN_WORDS): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return words.slice(0, maxWords).join(" ") + "…";
}

/** Human-readable duration from seconds (e.g. "2m 30s", "1h 5m"). */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min > 0 ? `${h}h ${min}m` : `${h}h`;
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [30, "d"],
    [12, "mo"],
  ];
  let value = seconds;
  const labels = ["s", "m", "h", "d", "mo", "y"];
  let i = 0;
  for (const [step] of intervals) {
    if (value < step) return `${value}${labels[i]}`;
    value = Math.floor(value / step);
    i++;
  }
  return `${value}${labels[labels.length - 1]}`;
}

export function truncate(str: string, max = 160): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + "…";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}
