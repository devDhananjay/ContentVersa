"use client";

import { useEffect, useState } from "react";
import { Accessibility, AudioLines, Palette, RotateCcw, X } from "lucide-react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Popover,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";
import { useColorVision } from "@/components/a11y/color-vision-provider";
import { useScreenReader } from "@/components/a11y/screen-reader-provider";
import { useA11yAnnounce } from "@/components/a11y/a11y-announcer";
import { ColorVisionPanel } from "@/components/a11y/color-vision-panel";
import { ScreenReaderPanel } from "@/components/a11y/screen-reader-panel";
import { A11yFab } from "@/components/a11y/shared/a11y-fab";
import { cn } from "@/lib/utils";

type HubTab = "reader" | "color";

export function AccessibilityHub() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<HubTab>("reader");
  const { announceUi } = useA11yAnnounce();
  const { isActive: readerActive, resetAll: resetReader, stopSpeaking } = useScreenReader();
  const { isActive: colorActive, resetAll: resetColor } = useColorVision();
  const anyActive = readerActive || colorActive;

  const resetEverything = () => {
    stopSpeaking();
    resetReader();
    resetColor();
    announceUi("All accessibility settings reset.");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <A11yFab
        variant="color-vision"
        isActive={anyActive}
        aria-label="Open accessibility tools"
        aria-expanded={open}
        aria-keyshortcuts="Alt+Shift+A"
        className="relative"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
        {anyActive && (
          <span
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-neon-green border-2 border-background"
            aria-hidden="true"
          />
        )}
      </A11yFab>

      <Popover
        placement="top end"
        offset={16}
        containerPadding={12}
        shouldFlip
        isNonModal
        className={cn(
          "z-[55] outline-none",
          "entering:animate-in entering:fade-in-0 entering:slide-in-from-bottom-2 entering:duration-200",
          "exiting:animate-out exiting:fade-out-0 exiting:slide-out-to-bottom-2 exiting:duration-150"
        )}
      >
        <Dialog
          className={cn(
            "w-[min(calc(100vw-1.5rem),24rem)] rounded-2xl border border-border/60",
            "bg-background shadow-2xl overflow-hidden outline-none"
          )}
        >
          <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-border/60">
            <div className="min-w-0">
              <Heading slot="title" className="text-base font-semibold leading-tight">
                Accessibility
              </Heading>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Read aloud &amp; color vision — easy one-tap controls
              </p>
              <p className="text-[10px] text-muted-foreground/80 mt-1 hidden sm:block">
                Shortcut:{" "}
                <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">Alt</kbd>+
                <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">Shift</kbd>+
                <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">A</kbd>
              </p>
            </div>
            <Button
              slot="close"
              className="shrink-0 rounded-lg p-1.5 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close accessibility panel"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <Tabs
            selectedKey={tab}
            onSelectionChange={(key) => setTab(key as HubTab)}
            className="flex flex-col"
          >
            <TabList aria-label="Accessibility sections" className="flex gap-1 px-4 pt-3 pb-2">
              <Tab
                id="reader"
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  "data-[selected]:bg-primary/15 data-[selected]:text-primary data-[selected]:border data-[selected]:border-primary/30",
                  "hover:bg-muted/50 cursor-pointer border border-transparent"
                )}
              >
                <AudioLines className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Read &amp; Listen</span>
              </Tab>
              <Tab
                id="color"
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  "data-[selected]:bg-primary/15 data-[selected]:text-primary data-[selected]:border data-[selected]:border-primary/30",
                  "hover:bg-muted/50 cursor-pointer border border-transparent"
                )}
              >
                <Palette className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Color Vision</span>
              </Tab>
            </TabList>

            <div className="max-h-[min(52dvh,32rem)] overflow-y-auto overscroll-contain px-4 pb-4">
              <TabPanel id="reader" className="outline-none pt-1 data-[inactive]:hidden">
                <ScreenReaderPanel />
              </TabPanel>
              <TabPanel id="color" className="outline-none pt-1 data-[inactive]:hidden">
                <ColorVisionPanel />
              </TabPanel>
            </div>

            <div className="border-t border-border/60 px-4 py-3 space-y-2">
              {anyActive && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Visual aids from either tab stay on until you reset. Use the button below to clear
                  everything at once.
                </p>
              )}
              <Button
                onPress={resetEverything}
                isDisabled={!anyActive}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 py-2.5 text-sm text-muted-foreground",
                  "outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:opacity-50 disabled:pointer-events-none"
                )}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset everything
              </Button>
            </div>
          </Tabs>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
