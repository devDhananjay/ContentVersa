/** Rotating homepage poll slugs — must exist in DB or fall back via getPollBySlug */
export const DAILY_POLL_SLUGS = [
  "ai-replace-jobs",
  "best-creator-tool-2026",
  "india-startup-bet",
  "cricket-format-pick",
  "newsletter-worth-it",
  "remote-work-india",
] as const;

export function getDailyPollSlug(date = new Date()): string {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return DAILY_POLL_SLUGS[dayIndex % DAILY_POLL_SLUGS.length];
}
