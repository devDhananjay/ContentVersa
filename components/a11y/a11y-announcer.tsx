"use client";

import { announce as ariaAnnounce } from "@react-aria/live-announcer";
import { createContext, useCallback, useContext, type ReactNode } from "react";
import { textToSpeech } from "@/lib/text-to-speech";

type A11yAnnouncerContextValue = {
  /** Short UI/status messages — live region only, never conflicts with content TTS. */
  announceUi: (message: string, priority?: "polite" | "assertive") => void;
  /** @deprecated Use announceUi for UI feedback. */
  announce: (message: string, priority?: "polite" | "assertive") => void;
};

const A11yAnnouncerContext = createContext<A11yAnnouncerContextValue | null>(null);

export function useA11yAnnounce() {
  const ctx = useContext(A11yAnnouncerContext);
  if (!ctx) {
    throw new Error("useA11yAnnounce must be used within A11yAnnouncerProvider");
  }
  return ctx;
}

export function A11yAnnouncerProvider({ children }: { children: ReactNode }) {
  const announceUi = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (!message.trim()) return;
      ariaAnnounce(message, priority);
    },
    []
  );

  return (
    <A11yAnnouncerContext.Provider value={{ announceUi, announce: announceUi }}>
      {children}
    </A11yAnnouncerContext.Provider>
  );
}

/** Pause content speech before assertive UI announcements when needed. */
export function announceUiSafely(message: string, priority: "polite" | "assertive" = "polite") {
  if (priority === "assertive" && textToSpeech.isSpeakingContent()) {
    textToSpeech.pause();
  }
  ariaAnnounce(message, priority);
}
