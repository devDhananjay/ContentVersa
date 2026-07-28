"use client";

import * as React from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { cn } from "@/lib/utils";

type ShareLocale = "en" | "hi";

function buildShareText(locale: ShareLocale, title: string, url: string) {
  if (locale === "hi") {
    return `📖 ${title}\n\nContentVerse pe padho 👇\n${url}\n\n#ContentVerse`;
  }
  return `📖 ${title}\n\nRead this on ContentVerse 👇\n${url}\n\n#ContentVerse`;
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
        "fixed bottom-20 md:bottom-6 left-1/2 z-40 -translate-x-1/2",
        "flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-background/95 px-3 py-2 shadow-lg backdrop-blur"
      )}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
      >
        <WhatsAppIcon className="h-4 w-4 text-white" />
        Share on WhatsApp
      </a>
      <div className="inline-flex rounded-full border border-border/60 p-0.5">
        {(["hi", "en"] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
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
