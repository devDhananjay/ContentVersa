/**
 * Homepage cinematic hero video.
 * Prefer a small MP4 (~1MB). The 9MB contentverse-home.mp4 tanks PageSpeed.
 * Enable with NEXT_PUBLIC_HOME_HERO_VIDEO_EXPERIMENT=1
 */
export const LOCAL_HERO_VIDEO_PATH = "/videos/home-hero.mp4";

/** Heavier alternate (kept on disk) — only set via env if you accept the weight. */
export const HEAVY_HERO_VIDEO_PATH = "/videos/contentverse-home.mp4";

export function isHomeHeroVideoEnabled() {
  return process.env.NEXT_PUBLIC_HOME_HERO_VIDEO_EXPERIMENT === "1";
}

export function homeHeroVideoUrl() {
  const configured = process.env.NEXT_PUBLIC_HOME_HERO_VIDEO_URL?.trim();
  if (configured) return configured;
  return LOCAL_HERO_VIDEO_PATH;
}
