const VIEWED_KEY = "cv_reel_viewed_ids";
export const REEL_VIEWED_EVENT = "cv:reel-viewed";

export function getLocallyViewedReelIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function markReelViewedLocally(reelId: string) {
  if (typeof window === "undefined") return;
  const ids = new Set(getLocallyViewedReelIds());
  if (ids.has(reelId)) return;
  ids.add(reelId);
  localStorage.setItem(VIEWED_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(new CustomEvent(REEL_VIEWED_EVENT, { detail: reelId }));
}
