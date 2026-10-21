/**
 * Homepage cinematic hero video (~2MB compressed contentverse-home.mp4).
 *
 * Kept OFF — site uses AmbientPageBackground (theme aurora) only.
 * Re-enable later only if product explicitly opts in again.
 */
export const LOCAL_HERO_VIDEO_PATH = "/videos/contentverse-home.mp4";

export function isHomeHeroVideoEnabled() {
  return false;
}

export function homeHeroVideoUrl() {
  const configured = process.env.NEXT_PUBLIC_HOME_HERO_VIDEO_URL?.trim();
  if (configured) return configured;
  return LOCAL_HERO_VIDEO_PATH;
}
