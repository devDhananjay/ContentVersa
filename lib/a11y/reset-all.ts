import {
  applyColorVisionSettings,
  DEFAULT_COLOR_VISION_SETTINGS,
  COLOR_VISION_STORAGE_KEY,
} from "@/lib/color-vision";
import {
  applyScreenReaderSettings,
  DEFAULT_SCREEN_READER_SETTINGS,
  SCREEN_READER_STORAGE_KEY,
} from "@/lib/screen-reader";

/** Clears every accessibility CSS class from the document root. */
export function clearAllAccessibilityClasses() {
  const root = document.documentElement;
  root.classList.remove(
    "sr-landmarks",
    "sr-enhanced-focus",
    "sr-readable-text",
    "sr-reduce-motion",
    "sr-read-aloud-focus",
    "cv-protanopia",
    "cv-deuteranopia",
    "cv-tritanopia",
    "cv-achromatopsia",
    "cv-high-contrast",
    "cv-highlight-links",
    "cv-enhanced-saturation"
  );
}

/** Resets persisted settings and applies defaults for both tools. */
export function resetAllAccessibilitySettings() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SCREEN_READER_STORAGE_KEY);
  localStorage.removeItem(COLOR_VISION_STORAGE_KEY);
  clearAllAccessibilityClasses();
  applyScreenReaderSettings(DEFAULT_SCREEN_READER_SETTINGS);
  applyColorVisionSettings(DEFAULT_COLOR_VISION_SETTINGS);

  return {
    screenReader: DEFAULT_SCREEN_READER_SETTINGS,
    colorVision: DEFAULT_COLOR_VISION_SETTINGS,
  };
}
