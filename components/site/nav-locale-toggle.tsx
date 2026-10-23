"use client";

import * as React from "react";
import {
  readSiteLocale,
  writeSiteLocale,
  SITE_LOCALE_EVENT,
  type SiteLocale,
} from "@/lib/site/locale";
import { cn } from "@/lib/utils";

/**
 * Compact HI / EN tabs — same pill style as WhatsApp share locale switch.
 */
export function NavLocaleToggle({
  className,
  immersive = false,
}: {
  className?: string;
  immersive?: boolean;
}) {
  const [locale, setLocale] = React.useState<SiteLocale>("en");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setLocale(readSiteLocale());
    setReady(true);
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ locale?: SiteLocale }>).detail;
      if (detail?.locale === "en" || detail?.locale === "hi") {
        setLocale(detail.locale);
      }
    };
    window.addEventListener(SITE_LOCALE_EVENT, onChange);
    return () => window.removeEventListener(SITE_LOCALE_EVENT, onChange);
  }, []);

  const pick = (code: SiteLocale) => {
    setLocale(code);
    writeSiteLocale(code);
  };

  return (
    <div
      className={cn(
        "inline-flex shrink-0 rounded-full border p-0.5",
        immersive ? "border-white/25" : "border-border/60",
        className
      )}
      role="group"
      aria-label="Language"
      data-ready={ready ? "1" : "0"}
    >
      {(["hi", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => pick(code)}
          className={cn(
            "rounded-full px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-wide transition-colors",
            locale === code
              ? immersive
                ? "bg-white text-black"
                : "bg-foreground text-background"
              : immersive
                ? "text-white/70 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={locale === code}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
