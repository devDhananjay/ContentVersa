import type { ContentSegment } from "@/lib/a11y/content-reader";
import {
  buildMainContentSegments,
  clearContentCache,
  describePageStructure,
  describePageStructureDetailed,
  extractSelectedText,
  getElementReadableText,
  segmentsToSpeechChunks,
} from "@/lib/a11y/content-reader";

export type SpeechPriority = "polite" | "assertive";

export type SpeechOptions = {
  rate?: number;
  pitch?: number;
  lang?: string;
};

export type SpeechMode = "idle" | "content" | "ui";

export type SpeechState = {
  speaking: boolean;
  paused: boolean;
  mode: SpeechMode;
  queueLength: number;
  currentIndex: number;
};

type StateListener = (state: SpeechState) => void;

const KEEP_ALIVE_MS = 9_000;

function isSpeechApiAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function isSpeechReliable() {
  if (!isSpeechApiAvailable()) return false;
  const ua = navigator.userAgent;
  if (/Firefox\//i.test(ua)) return false;
  return true;
}

class TextToSpeechEngine {
  private queue: string[] = [];
  private listeners = new Set<StateListener>();
  private speaking = false;
  private paused = false;
  private mode: SpeechMode = "idle";
  private sessionId = 0;
  private currentIndex = 0;
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private options: SpeechOptions = {};
  private lastQueueSnapshot: string[] = [];

  isSupported() {
    return isSpeechApiAvailable();
  }

  isReliable() {
    return isSpeechReliable();
  }

  subscribe(listener: StateListener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): SpeechState {
    return {
      speaking: this.speaking,
      paused: this.paused,
      mode: this.mode,
      queueLength: this.queue.length,
      currentIndex: this.currentIndex,
    };
  }

  setSpeechRate(rate: number) {
    this.options.rate = rate;
  }

  getSpeechRate() {
    return this.options.rate ?? 1;
  }

  private notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    if (!isSpeechApiAvailable()) return;

    this.keepAliveTimer = setInterval(() => {
      const synth = window.speechSynthesis;
      if (!synth.speaking || this.paused) return;
      synth.pause();
      synth.resume();
    }, KEEP_ALIVE_MS);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private createUtterance(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.options.rate ?? 1;
    utterance.pitch = this.options.pitch ?? 1;
    utterance.lang = this.options.lang ?? (document.documentElement.lang || "en");
    return utterance;
  }

  private speakNext() {
    if (!isSpeechApiAvailable() || this.paused) return;

    if (this.currentIndex >= this.queue.length) {
      this.finishSession();
      return;
    }

    const text = this.queue[this.currentIndex];
    const session = this.sessionId;
    const utterance = this.createUtterance(text);

    utterance.onstart = () => {
      if (session !== this.sessionId) return;
      this.speaking = true;
      this.notify();
    };

    utterance.onend = () => {
      if (session !== this.sessionId) return;
      this.currentIndex += 1;
      this.speakNext();
    };

    utterance.onerror = () => {
      if (session !== this.sessionId) return;
      this.currentIndex += 1;
      this.speakNext();
    };

    window.speechSynthesis.speak(utterance);
  }

  private beginSession(chunks: string[], mode: SpeechMode, options?: SpeechOptions) {
    if (!isSpeechApiAvailable()) return false;
    const filtered = chunks.map((chunk) => chunk.trim()).filter(Boolean);
    if (filtered.length === 0) return false;

    this.stopInternal(false);
    this.sessionId += 1;
    this.options = { ...this.options, ...options };
    this.queue = filtered;
    this.lastQueueSnapshot = [...filtered];
    this.currentIndex = 0;
    this.mode = mode;
    this.paused = false;
    this.speaking = true;
    this.notify();
    this.startKeepAlive();
    this.speakNext();
    return true;
  }

  private finishSession() {
    this.speaking = false;
    this.paused = false;
    this.mode = "idle";
    this.queue = [];
    this.currentIndex = 0;
    this.stopKeepAlive();
    this.notify();
  }

  private stopInternal(clearSnapshot: boolean) {
    if (!isSpeechApiAvailable()) return;
    this.sessionId += 1;
    window.speechSynthesis.cancel();
    this.queue = [];
    this.currentIndex = 0;
    this.speaking = false;
    this.paused = false;
    this.mode = "idle";
    if (clearSnapshot) this.lastQueueSnapshot = [];
    this.stopKeepAlive();
    this.notify();
  }

  speak(text: string, options?: SpeechOptions) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return false;
    return this.beginSession([normalized], "ui", options);
  }

  speakChunks(chunks: string[], options?: SpeechOptions) {
    return this.beginSession(chunks, "content", options);
  }

  speakMainContent(pathname?: string, options?: SpeechOptions) {
    clearContentCache();
    const segments = buildMainContentSegments(pathname ?? window.location.pathname);
    const chunks = segmentsToSpeechChunks(segments);
    return this.speakChunks(chunks, options);
  }

  speakSelection(options?: SpeechOptions) {
    const text = extractSelectedText();
    if (!text) return false;
    return this.beginSession([text], "content", options);
  }

  speakElement(element: Element | null, options?: SpeechOptions) {
    const text = getElementReadableText(element);
    if (!text) return false;
    return this.beginSession([text], "content", options);
  }

  speakPageStructure(options?: SpeechOptions) {
    const summary = describePageStructureDetailed();
    return this.beginSession([summary.announcement], "content", options);
  }

  pause() {
    if (!isSpeechApiAvailable() || !this.speaking || this.paused) return;
    window.speechSynthesis.pause();
    this.paused = true;
    this.notify();
  }

  resume() {
    if (!isSpeechApiAvailable() || !this.paused) return;
    window.speechSynthesis.resume();
    this.paused = false;
    this.notify();
  }

  stop() {
    this.stopInternal(true);
  }

  restart() {
    if (this.lastQueueSnapshot.length === 0) return false;
    return this.beginSession(this.lastQueueSnapshot, "content", this.options);
  }

  isSpeakingContent() {
    return this.speaking && this.mode === "content";
  }
}

export const textToSpeech = new TextToSpeechEngine();

export {
  buildMainContentSegments,
  clearContentCache,
  describePageStructure,
  describePageStructureDetailed,
  extractSelectedText,
  getElementReadableText,
  segmentsToSpeechChunks,
};

export type { ContentSegment };
