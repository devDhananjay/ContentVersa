export type ScreenReaderSettings = {
  highlightLandmarks: boolean;
  enhancedFocus: boolean;
  readableText: boolean;
  reduceMotion: boolean;
  readAloudOnFocus: boolean;
  autoReadOnNavigate: boolean;
  speechRate: number;
};

export const SCREEN_READER_STORAGE_KEY = "contentverse-screen-reader";

export const SPEECH_RATE_OPTIONS = [
  { value: 0.8, label: "Slow" },
  { value: 1, label: "Normal" },
  { value: 1.2, label: "Fast" },
] as const;

export const DEFAULT_SCREEN_READER_SETTINGS: ScreenReaderSettings = {
  highlightLandmarks: false,
  enhancedFocus: false,
  readableText: false,
  reduceMotion: false,
  readAloudOnFocus: false,
  autoReadOnNavigate: false,
  speechRate: 1,
};

const ALL_SR_CLASSES = [
  "sr-landmarks",
  "sr-enhanced-focus",
  "sr-readable-text",
  "sr-reduce-motion",
  "sr-read-aloud-focus",
];

export function loadScreenReaderSettings(): ScreenReaderSettings {
  if (typeof window === "undefined") return DEFAULT_SCREEN_READER_SETTINGS;

  try {
    const raw = localStorage.getItem(SCREEN_READER_STORAGE_KEY);
    if (!raw) return DEFAULT_SCREEN_READER_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ScreenReaderSettings>;
    return {
      highlightLandmarks:
        parsed.highlightLandmarks ?? DEFAULT_SCREEN_READER_SETTINGS.highlightLandmarks,
      enhancedFocus: parsed.enhancedFocus ?? DEFAULT_SCREEN_READER_SETTINGS.enhancedFocus,
      readableText: parsed.readableText ?? DEFAULT_SCREEN_READER_SETTINGS.readableText,
      reduceMotion: parsed.reduceMotion ?? DEFAULT_SCREEN_READER_SETTINGS.reduceMotion,
      readAloudOnFocus:
        parsed.readAloudOnFocus ?? DEFAULT_SCREEN_READER_SETTINGS.readAloudOnFocus,
      autoReadOnNavigate:
        parsed.autoReadOnNavigate ?? DEFAULT_SCREEN_READER_SETTINGS.autoReadOnNavigate,
      speechRate: parsed.speechRate ?? DEFAULT_SCREEN_READER_SETTINGS.speechRate,
    };
  } catch {
    return DEFAULT_SCREEN_READER_SETTINGS;
  }
}

export function saveScreenReaderSettings(settings: ScreenReaderSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCREEN_READER_STORAGE_KEY, JSON.stringify(settings));
}

export function applyScreenReaderSettings(settings: ScreenReaderSettings) {
  const root = document.documentElement;
  root.classList.remove(...ALL_SR_CLASSES);

  if (settings.highlightLandmarks) root.classList.add("sr-landmarks");
  if (settings.enhancedFocus) root.classList.add("sr-enhanced-focus");
  if (settings.readableText) root.classList.add("sr-readable-text");
  if (settings.reduceMotion) root.classList.add("sr-reduce-motion");
  if (settings.readAloudOnFocus) root.classList.add("sr-read-aloud-focus");
}

export function skipToMainContent() {
  const main = document.getElementById("main-content");
  if (!main) return false;

  if (!main.hasAttribute("tabindex")) {
    main.setAttribute("tabindex", "-1");
  }
  main.focus({ preventScroll: false });
  main.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export { describePageStructure } from "@/lib/a11y/content-reader";
