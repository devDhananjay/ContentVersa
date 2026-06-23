"use client";

import { Link2, Palette, RotateCcw, Sun } from "lucide-react";
import { Button, Radio, RadioGroup } from "react-aria-components";
import { useA11yAnnounce } from "@/components/a11y/a11y-announcer";
import { useColorVision } from "@/components/a11y/color-vision-provider";
import { A11yPresetChip } from "@/components/a11y/shared/a11y-preset-chip";
import { A11ySwitchRow } from "@/components/a11y/shared/a11y-switch-row";
import { COLOR_VISION_MODES, type ColorVisionMode } from "@/lib/color-vision";
import { cn } from "@/lib/utils";

export function ColorVisionPanel() {
  const { announceUi } = useA11yAnnounce();
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
    announceUi(`${label} ${enabled ? "on" : "off"}`);
  };

  const onModeChange = (value: string) => {
    const mode = value as ColorVisionMode;
    setMode(mode);
    const label = COLOR_VISION_MODES.find((item) => item.id === mode)?.label ?? mode;
    announceUi(`Color mode: ${label}`);
  };

  const applyGreenBlind = () => {
    setMode("deuteranopia");
    setHighContrast(true);
    setHighlightLinks(true);
    setEnhancedSaturation(true);
    announceUi("Green-blind friendly mode applied.");
  };

  const applyRedBlind = () => {
    setMode("protanopia");
    setHighContrast(true);
    setHighlightLinks(true);
    announceUi("Red-blind friendly mode applied.");
  };

  const applyFullAssist = () => {
    setMode("deuteranopia");
    setHighContrast(true);
    setHighlightLinks(true);
    setEnhancedSaturation(true);
    announceUi("Full color assist enabled.");
  };

  return (
    <div className="space-y-5">
      <section aria-labelledby="cv-quick-heading">
        <h3
          id="cv-quick-heading"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
        >
          Quick presets
        </h3>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Tap a preset — no need to adjust each setting manually.
        </p>
        <div className="flex flex-wrap gap-2">
          <A11yPresetChip
            label="Green-blind"
            hint="Most common — deuteranopia"
            onPress={applyGreenBlind}
            active={settings.mode === "deuteranopia" && settings.highContrast}
          />
          <A11yPresetChip
            label="Red-blind"
            hint="Protanopia assist"
            onPress={applyRedBlind}
            active={settings.mode === "protanopia" && settings.highContrast}
          />
          <A11yPresetChip
            label="Full assist"
            hint="Maximum color help"
            onPress={applyFullAssist}
            active={
              settings.mode === "deuteranopia" &&
              settings.highContrast &&
              settings.enhancedSaturation
            }
          />
          <A11yPresetChip
            label="Normal"
            hint="Reset colors"
            onPress={() => {
              resetAll();
              announceUi("Colors reset to normal.");
            }}
            active={!isActive}
          />
        </div>
      </section>

      <section aria-labelledby="cv-modes-heading">
        <h3
          id="cv-modes-heading"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"
        >
          Color mode
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
                "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left cursor-pointer min-h-[3rem]",
                "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
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
                    <span className="block text-sm font-semibold leading-tight">{mode.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
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
          Extra help
        </h3>
        <div className="space-y-3">
          <A11ySwitchRow
            id="cv-high-contrast"
            label="High contrast"
            description="Bolder text and sharper UI edges"
            icon={<Sun className="h-4 w-4" />}
            isSelected={settings.highContrast}
            onChange={(v) => {
              setHighContrast(v);
              announceToggle("High contrast", v);
            }}
          />
          <A11ySwitchRow
            id="cv-highlight-links"
            label="Underline links"
            description="Links stand out — not just by color"
            icon={<Link2 className="h-4 w-4" />}
            isSelected={settings.highlightLinks}
            onChange={(v) => {
              setHighlightLinks(v);
              announceToggle("Link underlines", v);
            }}
          />
          <A11ySwitchRow
            id="cv-enhanced-saturation"
            label="Boost colors"
            description="Makes similar colors easier to tell apart"
            icon={<Palette className="h-4 w-4" />}
            isSelected={settings.enhancedSaturation}
            onChange={(v) => {
              setEnhancedSaturation(v);
              announceToggle("Color boost", v);
            }}
          />
        </div>
      </section>

      <Button
        onPress={() => {
          resetAll();
          announceUi("Color settings reset.");
        }}
        isDisabled={!isActive}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 py-2.5 text-sm text-muted-foreground",
          "outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:opacity-50 disabled:pointer-events-none"
        )}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reset color settings
      </Button>
    </div>
  );
}
