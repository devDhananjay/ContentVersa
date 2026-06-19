/** Rotating homepage poll slugs — auto-created from catalog on first load */
export { DAILY_POLL_SLUGS } from "@/lib/polls/catalog";

import { DAILY_POLL_SLUGS } from "@/lib/polls/catalog";

export function getDailyPollSlug(date = new Date()): string {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return DAILY_POLL_SLUGS[dayIndex % DAILY_POLL_SLUGS.length];
}
