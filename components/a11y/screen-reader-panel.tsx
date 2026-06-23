"use client";

import {
  AudioLines,
  Focus,
  LayoutTemplate,
  MoveRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  TextCursorInput,
  Type,
  Volume2,
  Zap,
} from "lucide-react";
import { Button } from "react-aria-components";
import { useA11yAnnounce } from "@/components/a11y/a11y-announcer";
import { useScreenReader } from "@/components/a11y/screen-reader-provider";
import { A11yActionButton } from "@/components/a11y/shared/a11y-action-button";
import { A11yPresetChip } from "@/components/a11y/shared/a11y-preset-chip";
import { A11ySwitchRow } from "@/components/a11y/shared/a11y-switch-row";
import { SPEECH_RATE_OPTIONS, skipToMainContent } from "@/lib/screen-reader";
import { cn } from "@/lib/utils";

export function ScreenReaderPanel() {
  const { announceUi } = useA11yAnnounce();
  const {
    settings,
    speaking,
    paused,
    isSupported,
    isReliable,
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
    readPageStructure,
    pause,
    resume,
    stopSpeaking,
    restartReading,
    resetAll,
    isActive,
  } = useScreenReader();

  const announceToggle = (label: string, enabled: boolean) => {
    announceUi(`${label} ${enabled ? "on" : "off"}`);
  };

  const readingProgress =
    queueLength > 0
      ? `Part ${Math.min(currentIndex + 1, queueLength)} of ${queueLength}`
      : null;

  const applyEasyReading = () => {
    setReadableText(true);
    setEnhancedFocus(true);
    setReduceMotion(true);
    announceUi("Easy reading mode enabled.");
  };

  const applyListenMode = () => {
    setReadAloudOnFocus(true);
    setReadableText(true);
    setEnhancedFocus(true);
    announceUi("Listen mode enabled. Tap Read page to start.");
  };

  return (
    <div className="space-y-5">
      {!isSupported && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Text-to-speech is not supported in this browser.
        </p>
      )}
      {isSupported && !isReliable && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          Firefox has limited speech. Live announcements still work.
        </p>
      )}

      <section aria-labelledby="sr-quick-heading">
        <h3
          id="sr-quick-heading"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
        >
          Quick start
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <A11yPresetChip
            label="Easy reading"
            hint="Spacing, focus, and calmer motion"
            onPress={applyEasyReading}
            active={settings.readableText && settings.enhancedFocus && !settings.highlightLandmarks}
          />
          <A11yPresetChip
            label="Listen mode"
            hint="Read on focus and tap"
            onPress={applyListenMode}
            active={settings.readAloudOnFocus}
          />
        </div>
        <A11yActionButton
          disabled={!isSupported}
          highlight
          onPress={() => {
            stopSpeaking();
            const started = readMainContent();
            announceUi(
              started ? "Reading this page aloud." : "No readable content found.",
              "assertive"
            );
          }}
          icon={<Volume2 className="h-5 w-5" />}
          title="Read this page"
          description="One tap — reads the full page content aloud"
        />
      </section>

      <section aria-labelledby="sr-read-heading">
        <h3
          id="sr-read-heading"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"
        >
          More actions
        </h3>
        <div className="grid gap-2">
          <A11yActionButton
            disabled={!isSupported}
            onPress={() => {
              stopSpeaking();
              const started = readSelection();
              announceUi(
                started ? "Reading your selection." : "Highlight text first, then tap here.",
                "assertive"
              );
            }}
            icon={<TextCursorInput className="h-4 w-4" />}
            title="Read selected text"
            description="Select any text on the page, then tap"
          />
          <A11yActionButton
            disabled={!isSupported}
            onPress={() => {
              stopSpeaking();
              readPageStructure();
              announceUi("Describing page structure.", "assertive");
            }}
            icon={<LayoutTemplate className="h-4 w-4" />}
            title="Page overview"
            description="Headings, links, buttons, and sections"
          />
          <A11yActionButton
            onPress={() => {
              const moved = skipToMainContent();
              announceUi(moved ? "Jumped to main content." : "Main content not found.", "assertive");
            }}
            icon={<MoveRight className="h-4 w-4" />}
            title="Skip to content"
            description="Jump past navigation to the main article"
          />
        </div>

        {isSupported && speaking && (
          <div className="mt-3 space-y-2">
            {readingProgress && (
              <p className="text-xs text-center text-muted-foreground" aria-live="polite">
                {readingProgress}
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onPress={() => {
                  if (paused) {
                    resume();
                    announceUi("Resumed.");
                  } else {
                    pause();
                    announceUi("Paused.");
                  }
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 py-2 text-xs outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                {paused ? "Resume" : "Pause"}
              </Button>
              <Button
                onPress={() => {
                  stopSpeaking();
                  announceUi("Stopped.");
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 py-2 text-xs outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </Button>
              <Button
                onPress={() => {
                  const ok = restartReading();
                  announceUi(ok ? "Restarted." : "Nothing to restart.");
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 py-2 text-xs outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restart
              </Button>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="sr-speed-heading">
        <h3
          id="sr-speed-heading"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
        >
          Reading speed
        </h3>
        <div className="flex gap-2">
          {SPEECH_RATE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              onPress={() => {
                setSpeechRate(option.value);
                announceUi(`Speed: ${option.label}`);
              }}
              className={cn(
                "flex-1 rounded-lg border py-2 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                settings.speechRate === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 hover:bg-muted/50"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>

      <section aria-labelledby="sr-settings-heading">
        <h3
          id="sr-settings-heading"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"
        >
          Options
        </h3>
        <div className="space-y-3">
          <A11ySwitchRow
            id="sr-read-aloud-focus"
            label="Read on tap & focus"
            description="Speaks items when you tap or tab to them"
            icon={<Volume2 className="h-4 w-4" />}
            isSelected={settings.readAloudOnFocus}
            onChange={(v) => {
              setReadAloudOnFocus(v);
              announceToggle("Read on tap and focus", v);
            }}
          />
          <A11ySwitchRow
            id="sr-auto-read-navigate"
            label="Auto-read new pages"
            description="Reads content when you navigate to a new page"
            icon={<Zap className="h-4 w-4" />}
            isSelected={settings.autoReadOnNavigate}
            onChange={(v) => {
              setAutoReadOnNavigate(v);
              announceToggle("Auto-read new pages", v);
            }}
          />
          <A11ySwitchRow
            id="sr-landmarks"
            label="Show page regions"
            description="Highlights main, nav, header, and footer"
            icon={<LayoutTemplate className="h-4 w-4" />}
            isSelected={settings.highlightLandmarks}
            onChange={(v) => {
              setHighlightLandmarks(v);
              announceToggle("Page regions", v);
            }}
          />
          <A11ySwitchRow
            id="sr-enhanced-focus"
            label="Stronger focus ring"
            description="Easier to see where you are on the page"
            icon={<Focus className="h-4 w-4" />}
            isSelected={settings.enhancedFocus}
            onChange={(v) => {
              setEnhancedFocus(v);
              announceToggle("Focus ring", v);
            }}
          />
          <A11ySwitchRow
            id="sr-readable-text"
            label="Comfortable spacing"
            description="More space between letters and lines"
            icon={<Type className="h-4 w-4" />}
            isSelected={settings.readableText}
            onChange={(v) => {
              setReadableText(v);
              announceToggle("Text spacing", v);
            }}
          />
          <A11ySwitchRow
            id="sr-reduce-motion"
            label="Reduce motion"
            description="Less animation for a calmer experience"
            icon={<Sparkles className="h-4 w-4" />}
            isSelected={settings.reduceMotion}
            onChange={(v) => {
              setReduceMotion(v);
              announceToggle("Reduce motion", v);
            }}
          />
        </div>
      </section>

      <Button
        onPress={() => {
          stopSpeaking();
          resetAll();
          announceUi("Screen reader reset.");
        }}
        isDisabled={!isActive}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 py-2.5 text-sm text-muted-foreground",
          "outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:opacity-50 disabled:pointer-events-none"
        )}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reset reader settings
      </Button>
    </div>
  );
}
