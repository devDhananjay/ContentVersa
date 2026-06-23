"use client";

import { Accessibility, Link2, Palette, RotateCcw, Sun } from "lucide-react";
import {
  Button,
  DialogTrigger,
  Popover,
  Radio,
  RadioGroup,
} from "react-aria-components";
import { useA11yAnnounce } from "@/components/a11y/a11y-announcer";
import { useColorVision } from "@/components/a11y/color-vision-provider";
import { A11yFab } from "@/components/a11y/shared/a11y-fab";
import { A11yPanel } from "@/components/a11y/shared/a11y-panel";
import { A11ySwitchRow } from "@/components/a11y/shared/a11y-switch-row";
import { COLOR_VISION_MODES, type ColorVisionMode } from "@/lib/color-vision";
import { cn } from "@/lib/utils";

export function ColorVisionWidget() {
  const { announce } = useA11yAnnounce();
  const {
    settings,
    setMode,
    setHighContrast,
    setHighlightLinks,
    setEnhancedSaturation,
    resetAll,
    isActive,
  } = useColorVision();

  const announceToggle = (label: string, enabled: boolean) => {
    announce(`${label} ${enabled ? "enabled" : "disabled"}`);
  };

  const onModeChange = (value: string) => {
    const mode = value as ColorVisionMode;
    setMode(mode);
    const label = COLOR_VISION_MODES.find((item) => item.id === mode)?.label ?? mode;
    announce(`Color vision mode set to ${label}.`);
  };

  return (
    <DialogTrigger>
      <A11yFab
        variant="color-vision"
        isActive={isActive}
        aria-label="Open color vision accessibility tools"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
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
          title="Color vision tools"
          description="WCAG-compliant adjustments for color blindness"
          icon={<Palette className="h-4 w-4" aria-hidden="true" />}
        >
          <div className="max-h-[min(55vh,26rem)] overflow-y-auto px-5 py-4 space-y-5">
            <section aria-labelledby="cv-modes-heading">
              <h3
                id="cv-modes-heading"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"
              >
                Color vision mode
              </h3>
              <RadioGroup
                value={settings.mode}
                onChange={onModeChange}
                aria-labelledby="cv-modes-heading"
                className="grid gap-2"
              >
                {COLOR_VISION_MODES.map((mode) => (
                  <Radio
                    key={mode.id}
                    value={mode.id}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left cursor-pointer",
                      "outline-none transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-ring",
                      "data-[selected]:border-primary data-[selected]:bg-primary/10",
                      "border-border/60 hover:bg-muted/50"
                    )}
                  >
                    {({ isSelected }) => (
                      <>
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40"
                          )}
                          aria-hidden="true"
                        >
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium leading-tight">
                            {mode.label}
                          </span>
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {mode.description}
                          </span>
                        </span>
                      </>
                    )}
                  </Radio>
                ))}
              </RadioGroup>
            </section>

            <section aria-labelledby="cv-enhancements-heading">
              <h3
                id="cv-enhancements-heading"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"
              >
                Enhancements
              </h3>
              <div className="space-y-3">
                <A11ySwitchRow
                  id="cv-high-contrast"
                  label="High contrast"
                  description="WCAG 1.4.3 — stronger text and UI contrast"
                  icon={<Sun className="h-4 w-4" />}
                  isSelected={settings.highContrast}
                  onChange={(value) => {
                    setHighContrast(value);
                    announceToggle("High contrast", value);
                  }}
                />
                <A11ySwitchRow
                  id="cv-highlight-links"
                  label="Highlight links"
                  description="WCAG 1.4.1 — links not identified by color alone"
                  icon={<Link2 className="h-4 w-4" />}
                  isSelected={settings.highlightLinks}
                  onChange={(value) => {
                    setHighlightLinks(value);
                    announceToggle("Link highlighting", value);
                  }}
                />
                <A11ySwitchRow
                  id="cv-enhanced-saturation"
                  label="Enhanced saturation"
                  description="Boosts color distinction for subtle hues"
                  icon={<Palette className="h-4 w-4" />}
                  isSelected={settings.enhancedSaturation}
                  onChange={(value) => {
                    setEnhancedSaturation(value);
                    announceToggle("Enhanced saturation", value);
                  }}
                />
              </div>
            </section>
          </div>

          <div className="border-t border-border/60 px-5 py-3">
            <Button
              onPress={() => {
                resetAll();
                announce("Color vision settings reset.");
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
