"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  applyScreenReaderSettings,
  DEFAULT_SCREEN_READER_SETTINGS,
  loadScreenReaderSettings,
  saveScreenReaderSettings,
  type ScreenReaderSettings,
} from "@/lib/screen-reader";
import { clearContentCache, textToSpeech } from "@/lib/text-to-speech";
import { ROUTE_READ_DELAY_MS } from "@/lib/a11y/constants";
import { ScreenReaderListener } from "@/components/a11y/screen-reader-listener";
import { announceUiSafely } from "@/components/a11y/a11y-announcer";

type ScreenReaderContextValue = {
  settings: ScreenReaderSettings;
  speaking: boolean;
  paused: boolean;
  isSupported: boolean;
  isReliable: boolean;
  queueLength: number;
  currentIndex: number;
  setHighlightLandmarks: (enabled: boolean) => void;
  setEnhancedFocus: (enabled: boolean) => void;
  setReadableText: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setReadAloudOnFocus: (enabled: boolean) => void;
  setAutoReadOnNavigate: (enabled: boolean) => void;
  setSpeechRate: (rate: number) => void;
  readMainContent: () => boolean;
  readSelection: () => boolean;
  readFocusedElement: (element: Element | null) => boolean;
  readPageStructure: () => boolean;
  pause: () => void;
  resume: () => void;
  stopSpeaking: () => void;
  restartReading: () => boolean;
  resetAll: () => void;
  isActive: boolean;
};

const ScreenReaderContext = createContext<ScreenReaderContextValue | null>(null);

export function useScreenReader() {
  const ctx = useContext(ScreenReaderContext);
  if (!ctx) {
    throw new Error("useScreenReader must be used within ScreenReaderProvider");
  }
  return ctx;
}

export function ScreenReaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<ScreenReaderSettings>(DEFAULT_SCREEN_READER_SETTINGS);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [queueLength, setQueueLength] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const initialNavigationRef = useRef(true);
  const routeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = loadScreenReaderSettings();
    setSettings(stored);
    applyScreenReaderSettings(stored);
    textToSpeech.setSpeechRate(stored.speechRate);
  }, []);

  useEffect(() => {
    const unsubscribe = textToSpeech.subscribe((state) => {
      setSpeaking(state.speaking);
      setPaused(state.paused);
      setQueueLength(state.queueLength);
      setCurrentIndex(state.currentIndex);
    });
    return unsubscribe;
  }, []);

  const updateSettings = useCallback(
    (updater: (prev: ScreenReaderSettings) => ScreenReaderSettings) => {
      setSettings((prev) => {
        const next = updater(prev);
        saveScreenReaderSettings(next);
        applyScreenReaderSettings(next);
        return next;
      });
    },
    []
  );

  const setHighlightLandmarks = useCallback(
    (highlightLandmarks: boolean) => updateSettings((prev) => ({ ...prev, highlightLandmarks })),
    [updateSettings]
  );

  const setEnhancedFocus = useCallback(
    (enhancedFocus: boolean) => updateSettings((prev) => ({ ...prev, enhancedFocus })),
    [updateSettings]
  );

  const setReadableText = useCallback(
    (readableText: boolean) => updateSettings((prev) => ({ ...prev, readableText })),
    [updateSettings]
  );

  const setReduceMotion = useCallback(
    (reduceMotion: boolean) => updateSettings((prev) => ({ ...prev, reduceMotion })),
    [updateSettings]
  );

  const setReadAloudOnFocus = useCallback(
    (readAloudOnFocus: boolean) => updateSettings((prev) => ({ ...prev, readAloudOnFocus })),
    [updateSettings]
  );

  const setAutoReadOnNavigate = useCallback(
    (autoReadOnNavigate: boolean) =>
      updateSettings((prev) => ({ ...prev, autoReadOnNavigate })),
    [updateSettings]
  );

  const setSpeechRate = useCallback(
    (speechRate: number) => {
      textToSpeech.setSpeechRate(speechRate);
      updateSettings((prev) => ({ ...prev, speechRate }));
    },
    [updateSettings]
  );

  const readMainContent = useCallback(() => {
    clearContentCache();
    return textToSpeech.speakMainContent(pathname);
  }, [pathname]);

  const readSelection = useCallback(() => textToSpeech.speakSelection(), []);

  const readFocusedElement = useCallback(
    (element: Element | null) => textToSpeech.speakElement(element),
    []
  );

  const readPageStructure = useCallback(() => textToSpeech.speakPageStructure(), []);

  const pause = useCallback(() => textToSpeech.pause(), []);
  const resume = useCallback(() => textToSpeech.resume(), []);
  const stopSpeaking = useCallback(() => textToSpeech.stop(), []);
  const restartReading = useCallback(() => textToSpeech.restart(), []);

  const resetAll = useCallback(() => {
    textToSpeech.stop();
    updateSettings(() => DEFAULT_SCREEN_READER_SETTINGS);
  }, [updateSettings]);

  useEffect(() => {
    if (initialNavigationRef.current) {
      initialNavigationRef.current = false;
      return;
    }

    if (routeTimerRef.current) clearTimeout(routeTimerRef.current);
    textToSpeech.stop();
    clearContentCache();

    routeTimerRef.current = setTimeout(() => {
      const title = document.title.trim();
      const navMessage = title
        ? `Navigated to ${title}. Page loaded.`
        : "Page loaded.";

      announceUiSafely(navMessage, "assertive");

      if (settings.autoReadOnNavigate) {
        const started = textToSpeech.speakMainContent(pathname);
        if (!started) {
          announceUiSafely("No readable main content found on this page.", "polite");
        }
      }
    }, ROUTE_READ_DELAY_MS);

    return () => {
      if (routeTimerRef.current) clearTimeout(routeTimerRef.current);
    };
  }, [pathname, settings.autoReadOnNavigate]);

  const isActive = useMemo(
    () =>
      settings.highlightLandmarks ||
      settings.enhancedFocus ||
      settings.readableText ||
      settings.reduceMotion ||
      settings.readAloudOnFocus ||
      settings.autoReadOnNavigate ||
      speaking,
    [settings, speaking]
  );

  const value = useMemo(
    () => ({
      settings,
      speaking,
      paused,
      isSupported: textToSpeech.isSupported(),
      isReliable: textToSpeech.isReliable(),
      queueLength,
      currentIndex,
      setHighlightLandmarks,
      setEnhancedFocus,
      setReadableText,
      setReduceMotion,
      setReadAloudOnFocus,
      setAutoReadOnNavigate,
      setSpeechRate,
      readMainContent,
      readSelection,
      readFocusedElement,
      readPageStructure,
      pause,
      resume,
      stopSpeaking,
      restartReading,
      resetAll,
      isActive,
    }),
    [
      settings,
      speaking,
      paused,
      queueLength,
      currentIndex,
      setHighlightLandmarks,
      setEnhancedFocus,
      setReadableText,
      setReduceMotion,
      setReadAloudOnFocus,
      setAutoReadOnNavigate,
      setSpeechRate,
      readMainContent,
      readSelection,
      readFocusedElement,
      readPageStructure,
      pause,
      resume,
      stopSpeaking,
      restartReading,
      resetAll,
      isActive,
    ]
  );

  return (
    <ScreenReaderContext.Provider value={value}>
      <ScreenReaderListener />
      {children}
    </ScreenReaderContext.Provider>
  );
}
