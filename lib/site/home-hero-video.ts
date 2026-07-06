/** Local experiment — enable with NEXT_PUBLIC_HOME_HERO_VIDEO_EXPERIMENT=1 in .env.local only. */
export const LOCAL_HERO_VIDEO_PATH = "/videos/home-hero.mp4";

export function isHomeHeroVideoEnabled() {
  return process.env.NEXT_PUBLIC_HOME_HERO_VIDEO_EXPERIMENT === "1";
}

export function homeHeroVideoUrl() {
  const configured = process.env.NEXT_PUBLIC_HOME_HERO_VIDEO_URL?.trim();
  if (configured) return configured;
  return LOCAL_HERO_VIDEO_PATH;
}
