export type ColorVisionMode =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

export type ColorVisionSettings = {
  mode: ColorVisionMode;
  highContrast: boolean;
  highlightLinks: boolean;
  enhancedSaturation: boolean;
};

export const COLOR_VISION_STORAGE_KEY = "contentverse-color-vision";

export const DEFAULT_COLOR_VISION_SETTINGS: ColorVisionSettings = {
  mode: "normal",
  highContrast: false,
  highlightLinks: false,
  enhancedSaturation: false,
};

const MODE_CLASSES: Record<ColorVisionMode, string> = {
  normal: "",
  protanopia: "cv-protanopia",
  deuteranopia: "cv-deuteranopia",
  tritanopia: "cv-tritanopia",
  achromatopsia: "cv-achromatopsia",
};

const ALL_CV_CLASSES = [
  "cv-protanopia",
  "cv-deuteranopia",
  "cv-tritanopia",
  "cv-achromatopsia",
  "cv-high-contrast",
  "cv-highlight-links",
  "cv-enhanced-saturation",
];

export function loadColorVisionSettings(): ColorVisionSettings {
  if (typeof window === "undefined") return DEFAULT_COLOR_VISION_SETTINGS;

  try {
    const raw = localStorage.getItem(COLOR_VISION_STORAGE_KEY);
    if (!raw) return DEFAULT_COLOR_VISION_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ColorVisionSettings>;
    return {
      mode: parsed.mode ?? DEFAULT_COLOR_VISION_SETTINGS.mode,
      highContrast: parsed.highContrast ?? DEFAULT_COLOR_VISION_SETTINGS.highContrast,
      highlightLinks: parsed.highlightLinks ?? DEFAULT_COLOR_VISION_SETTINGS.highlightLinks,
      enhancedSaturation:
        parsed.enhancedSaturation ?? DEFAULT_COLOR_VISION_SETTINGS.enhancedSaturation,
    };
  } catch {
    return DEFAULT_COLOR_VISION_SETTINGS;
  }
}

export function saveColorVisionSettings(settings: ColorVisionSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COLOR_VISION_STORAGE_KEY, JSON.stringify(settings));
}

export function applyColorVisionSettings(settings: ColorVisionSettings) {
  const root = document.documentElement;
  root.classList.remove(...ALL_CV_CLASSES);

  const modeClass = MODE_CLASSES[settings.mode];
  if (modeClass) root.classList.add(modeClass);
  if (settings.highContrast) root.classList.add("cv-high-contrast");
  if (settings.highlightLinks) root.classList.add("cv-highlight-links");
  if (settings.enhancedSaturation) root.classList.add("cv-enhanced-saturation");
}

export const COLOR_VISION_MODES: {
  id: ColorVisionMode;
  label: string;
  description: string;
}[] = [
  {
    id: "normal",
    label: "Normal vision",
    description: "Default site colors",
  },
  {
    id: "protanopia",
    label: "Protanopia",
    description: "Red-blind — adjusts reds and greens",
  },
  {
    id: "deuteranopia",
    label: "Deuteranopia",
    description: "Green-blind — most common form",
  },
  {
    id: "tritanopia",
    label: "Tritanopia",
    description: "Blue-yellow blind — adjusts blues",
  },
  {
    id: "achromatopsia",
    label: "Achromatopsia",
    description: "Complete color blindness — grayscale",
  },
];
