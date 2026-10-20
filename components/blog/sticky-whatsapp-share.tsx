"use client";

import * as React from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { cn } from "@/lib/utils";

type ShareLocale = "en" | "hi";

function buildShareText(locale: ShareLocale, title: string, url: string) {
  if (locale === "hi") {
    return `📖 ${title}\n\nContentVerse India pe padho 👇\n${url}\n\n#ContentVerse India`;
  }
  return `📖 ${title}\n\nRead this on ContentVerse India 👇\n${url}\n\n#ContentVerse India`;
}

/** Sticky WhatsApp CTA after ~40% scroll — India forward culture. */
export function StickyWhatsAppShare({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [visible, setVisible] = React.useState(false);
  const [locale, setLocale] = React.useState<ShareLocale>("hi");

  React.useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
      setVisible(pct >= 40 && pct < 92);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const href = `https://wa.me/?text=${encodeURIComponent(
    buildShareText(locale, title, url)
  )}`;

  return (
    <div
      className={cn(
        "fixed z-40 flex items-center gap-1.5 rounded-full border border-[#25D366]/35 bg-background/95 shadow-lg backdrop-blur-md",
        // Mobile: left side — clear of bottom nav + right chat/a11y FABs
        "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-3 right-auto max-w-[min(17.5rem,calc(100vw-5.75rem))] -translate-x-0 px-1.5 py-1.5",
        // Desktop: centered bottom
        "md:bottom-6 md:left-1/2 md:max-w-none md:-translate-x-1/2 md:gap-2 md:px-3 md:py-2"
      )}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-2 text-xs font-semibold text-white sm:gap-2 sm:px-4 sm:text-sm"
      >
        <WhatsAppIcon className="h-4 w-4 shrink-0 text-white" />
        <span className="truncate">Share on WhatsApp</span>
      </a>
      <div
        className="inline-flex shrink-0 rounded-full border border-border/60 p-0.5"
        role="group"
        aria-label="Share language"
      >
        {(["hi", "en"] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={cn(
              "rounded-full px-2 py-1 text-[10px] font-bold uppercase leading-none",
              locale === code
                ? "bg-foreground text-background"
                : "text-muted-foreground"
            )}
          >
            {code}
          </button>
        ))}
      </div>
    </div>
  );
}
