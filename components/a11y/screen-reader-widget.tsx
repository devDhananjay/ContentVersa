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
} from "lucide-react";
import { Button, DialogTrigger, Popover } from "react-aria-components";
import { useA11yAnnounce } from "@/components/a11y/a11y-announcer";
import { useScreenReader } from "@/components/a11y/screen-reader-provider";
import { A11yFab } from "@/components/a11y/shared/a11y-fab";
import { A11yPanel } from "@/components/a11y/shared/a11y-panel";
import { A11ySwitchRow } from "@/components/a11y/shared/a11y-switch-row";
import { skipToMainContent } from "@/lib/screen-reader";
import { cn } from "@/lib/utils";

function ActionButton({
  onPress,
  icon,
  title,
  description,
  disabled,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <Button
      onPress={onPress}
      isDisabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 text-left",
        "outline-none transition-colors hover:bg-muted/50",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-50 disabled:pointer-events-none"
      )}
    >
      <span className="shrink-0 text-primary" aria-hidden="true">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground mt-0.5">{description}</span>
      </span>
    </Button>
  );
}

export function ScreenReaderWidget() {
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
    announceUi(`${label} ${enabled ? "enabled" : "disabled"}`);
  };

  const readingProgress =
    queueLength > 0 ? `Reading segment ${Math.min(currentIndex + 1, queueLength)} of ${queueLength}` : null;

  return (
    <DialogTrigger>
      <A11yFab
        variant="screen-reader"
        isActive={isActive}
        aria-label="Open screen reader accessibility tools"
      >
        <AudioLines className="h-5 w-5" aria-hidden="true" />
      </A11yFab>

      <Popover
        placement="top end"
        offset={12}
        className={cn(
          "z-[46] entering:animate-in entering:fade-in-0 entering:slide-in-from-bottom-2 entering:duration-200",
          "exiting:animate-out exiting:fade-out-0 exiting:slide-out-to-bottom-2 exiting:duration-150"
        )}
      >
        <A11yPanel
          title="Screen reader tools"
          description="Read aloud, navigation, and reading aids"
          icon={<AudioLines className="h-4 w-4" aria-hidden="true" />}
        >
          <div className="max-h-[min(55vh,32rem)] overflow-y-auto px-5 py-4 space-y-5">
            {!isSupported && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                Text-to-speech is not supported in this browser.
              </p>
            )}
            {isSupported && !isReliable && (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                Firefox has limited speech support. Live announcements still work.
              </p>
            )}

            <section aria-labelledby="sr-read-heading">
              <h3
                id="sr-read-heading"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"
              >
                Read aloud
              </h3>
              <div className="grid gap-2">
                <ActionButton
                  disabled={!isSupported}
                  onPress={() => {
                    stopSpeaking();
                    const started = readMainContent();
                    announceUi(
                      started
                        ? "Reading main page content aloud."
                        : "No readable main content was found on this page.",
                      "assertive"
                    );
                  }}
                  icon={<Volume2 className="h-4 w-4" />}
                  title="Read page content"
                  description="Headings, paragraphs, links, buttons, forms, tables, and images"
                />
                <ActionButton
                  disabled={!isSupported}
                  onPress={() => {
                    stopSpeaking();
                    const started = readSelection();
                    announceUi(
                      started
                        ? "Reading selected text aloud."
                        : "Select text on the page first, then use this action.",
                      "assertive"
                    );
                  }}
                  icon={<TextCursorInput className="h-4 w-4" />}
                  title="Read selected text"
                  description="Speaks the text you have highlighted"
                />
                <ActionButton
                  disabled={!isSupported}
                  onPress={() => {
                    stopSpeaking();
                    const started = readPageStructure();
                    announceUi(
                      started
                        ? "Describing page structure."
                        : "Unable to describe page structure.",
                      "assertive"
                    );
                  }}
                  icon={<LayoutTemplate className="h-4 w-4" />}
                  title="Describe page structure"
                  description="Title, landmarks, counts, and major headings"
                />
                <ActionButton
                  onPress={() => {
                    const moved = skipToMainContent();
                    announceUi(
                      moved
                        ? "Moved focus to main content."
                        : "Main content landmark was not found.",
                      "assertive"
                    );
                  }}
                  icon={<MoveRight className="h-4 w-4" />}
                  title="Skip to main content"
                  description="WCAG 2.4.1 — bypass repeated blocks"
                />
              </div>

              {isSupported && speaking && (
                <div className="mt-3 space-y-2">
                  {readingProgress && (
                    <p className="text-xs text-muted-foreground text-center" aria-live="polite">
                      {readingProgress}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onPress={() => {
                        if (paused) {
                          resume();
                          announceUi("Reading resumed.");
                        } else {
                          pause();
                          announceUi("Reading paused.");
                        }
                      }}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm",
                        "outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      {paused ? (
                        <Play className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Pause className="h-4 w-4" aria-hidden="true" />
                      )}
                      {paused ? "Resume" : "Pause"}
                    </Button>
                    <Button
                      onPress={() => {
                        stopSpeaking();
                        announceUi("Reading stopped.");
                      }}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm",
                        "outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      <Square className="h-4 w-4" aria-hidden="true" />
                      Stop
                    </Button>
                    <Button
                      onPress={() => {
                        const restarted = restartReading();
                        announceUi(
                          restarted ? "Reading restarted." : "Nothing to restart.",
                          "polite"
                        );
                      }}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm",
                        "outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Restart
                    </Button>
                  </div>
                </div>
              )}
            </section>

            <section aria-labelledby="sr-settings-heading">
              <h3
                id="sr-settings-heading"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"
              >
                Reading aids
              </h3>
              <div className="space-y-3">
                <A11ySwitchRow
                  id="sr-read-aloud-focus"
                  label="Read aloud on focus"
                  description="Speaks focused or tapped elements with debouncing"
                  icon={<Volume2 className="h-4 w-4" />}
                  isSelected={settings.readAloudOnFocus}
                  onChange={(value) => {
                    setReadAloudOnFocus(value);
                    announceToggle("Read aloud on focus", value);
                  }}
                />
                <A11ySwitchRow
                  id="sr-auto-read-navigate"
                  label="Auto-read on navigation"
                  description="Reads new page content after route changes"
                  icon={<MoveRight className="h-4 w-4" />}
                  isSelected={settings.autoReadOnNavigate}
                  onChange={(value) => {
                    setAutoReadOnNavigate(value);
                    announceToggle("Auto-read on navigation", value);
                  }}
                />
                <A11ySwitchRow
                  id="sr-landmarks"
                  label="Highlight landmarks"
                  description="Shows main, nav, header, and footer regions"
                  icon={<LayoutTemplate className="h-4 w-4" />}
                  isSelected={settings.highlightLandmarks}
                  onChange={(value) => {
                    setHighlightLandmarks(value);
                    announceToggle("Landmark highlights", value);
                  }}
                />
                <A11ySwitchRow
                  id="sr-enhanced-focus"
                  label="Enhanced focus"
                  description="WCAG 2.4.7 — stronger keyboard focus rings"
                  icon={<Focus className="h-4 w-4" />}
                  isSelected={settings.enhancedFocus}
                  onChange={(value) => {
                    setEnhancedFocus(value);
                    announceToggle("Enhanced focus", value);
                  }}
                />
                <A11ySwitchRow
                  id="sr-readable-text"
                  label="Readable text spacing"
                  description="WCAG 1.4.12 — line, letter, and word spacing"
                  icon={<Type className="h-4 w-4" />}
                  isSelected={settings.readableText}
                  onChange={(value) => {
                    setReadableText(value);
                    announceToggle("Readable text spacing", value);
                  }}
                />
                <A11ySwitchRow
                  id="sr-reduce-motion"
                  label="Reduce motion"
                  description="WCAG 2.3.1 — minimizes animations"
                  icon={<Sparkles className="h-4 w-4" />}
                  isSelected={settings.reduceMotion}
                  onChange={(value) => {
                    setReduceMotion(value);
                    announceToggle("Reduce motion", value);
                  }}
                />
              </div>
            </section>
          </div>

          <div className="border-t border-border/60 px-5 py-3">
            <Button
              onPress={() => {
                stopSpeaking();
                resetAll();
                announceUi("Screen reader settings reset.");
              }}
              isDisabled={!isActive}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground",
                "outline-none transition-colors hover:bg-muted/50",
                "focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:opacity-50 disabled:pointer-events-none"
              )}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset all settings
            </Button>
          </div>
        </A11yPanel>
      </Popover>
    </DialogTrigger>
  );
}
