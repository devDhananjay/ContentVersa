/** Minimum caption length (Instagram-style). */
export const REEL_MIN_CAPTION_CHARS = 10;

/** Maximum caption length. */
export const REEL_MAX_CAPTION_CHARS = 100;

/** Max video upload size (20 MB). */
export const REEL_MAX_VIDEO_BYTES = 20 * 1024 * 1024;

/** Max image upload size (5 MB). */
export const REEL_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** How long image reels stay visible before auto-advance (seconds). */
export const REEL_IMAGE_DURATION_SEC = 7;

/** Fallback video duration if metadata missing (seconds). */
export const REEL_DEFAULT_VIDEO_DURATION_SEC = 15;

/** Max auto-play duration cap (seconds). */
export const REEL_MAX_PLAY_DURATION_SEC = 90;

export const REEL_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

export const REEL_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);
