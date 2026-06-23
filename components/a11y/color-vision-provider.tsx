"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyColorVisionSettings,
  DEFAULT_COLOR_VISION_SETTINGS,
  loadColorVisionSettings,
  saveColorVisionSettings,
  type ColorVisionMode,
  type ColorVisionSettings,
} from "@/lib/color-vision";
import { ColorVisionFilters } from "@/components/a11y/color-vision-filters";

type ColorVisionContextValue = {
  settings: ColorVisionSettings;
  setMode: (mode: ColorVisionMode) => void;
  setHighContrast: (enabled: boolean) => void;
  setHighlightLinks: (enabled: boolean) => void;
  setEnhancedSaturation: (enabled: boolean) => void;
  resetAll: () => void;
  isActive: boolean;
};

const ColorVisionContext = createContext<ColorVisionContextValue | null>(null);

export function useColorVision() {
  const ctx = useContext(ColorVisionContext);
  if (!ctx) {
    throw new Error("useColorVision must be used within ColorVisionProvider");
  }
  return ctx;
}

export function ColorVisionProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ColorVisionSettings>(DEFAULT_COLOR_VISION_SETTINGS);

  useEffect(() => {
    const stored = loadColorVisionSettings();
    setSettings(stored);
    applyColorVisionSettings(stored);
  }, []);

  const updateSettings = useCallback(
    (updater: (prev: ColorVisionSettings) => ColorVisionSettings) => {
      setSettings((prev) => {
        const next = updater(prev);
        saveColorVisionSettings(next);
        applyColorVisionSettings(next);
        return next;
      });
    },
    []
  );

  const setMode = useCallback(
    (mode: ColorVisionMode) => updateSettings((prev) => ({ ...prev, mode })),
    [updateSettings]
  );

  const setHighContrast = useCallback(
    (highContrast: boolean) => updateSettings((prev) => ({ ...prev, highContrast })),
    [updateSettings]
  );

  const setHighlightLinks = useCallback(
    (highlightLinks: boolean) => updateSettings((prev) => ({ ...prev, highlightLinks })),
    [updateSettings]
  );

  const setEnhancedSaturation = useCallback(
    (enhancedSaturation: boolean) =>
      updateSettings((prev) => ({ ...prev, enhancedSaturation })),
    [updateSettings]
  );

  const resetAll = useCallback(() => {
    updateSettings(() => DEFAULT_COLOR_VISION_SETTINGS);
  }, [updateSettings]);

  const isActive = useMemo(
    () =>
      settings.mode !== "normal" ||
      settings.highContrast ||
      settings.highlightLinks ||
      settings.enhancedSaturation,
    [settings]
  );

  const value = useMemo(
    () => ({
      settings,
      setMode,
      setHighContrast,
      setHighlightLinks,
      setEnhancedSaturation,
      resetAll,
      isActive,
    }),
    [
      settings,
      setMode,
      setHighContrast,
      setHighlightLinks,
      setEnhancedSaturation,
      resetAll,
      isActive,
    ]
  );

  return (
    <ColorVisionContext.Provider value={value}>
      <ColorVisionFilters />
      {children}
    </ColorVisionContext.Provider>
  );
}
