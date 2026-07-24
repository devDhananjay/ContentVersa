"use client";

import * as React from "react";
import { Twitter, Linkedin, Link2, Facebook, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { cn } from "@/lib/utils";

type ShareLocale = "en" | "hi";

function buildShareText(
  locale: ShareLocale,
  title: string,
  url: string
): string {
  if (locale === "hi") {
    return `📖 ${title}\n\nContentVerse pe padho 👇\n${url}\n\n#ContentVerse`;
  }
  return `📖 ${title}\n\nRead this on ContentVerse 👇\n${url}\n\n#ContentVerse`;
}

export function ShareBar({
  url,
  title,
  imageUrl,
  className,
}: {
  url: string;
  title: string;
  /** Cover / OG image — used in share hint; WhatsApp picks OG from URL. */
  imageUrl?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const [locale, setLocale] = React.useState<ShareLocale>("en");

  const shareText = buildShareText(locale, title, url);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);
  const tweetText = encodeURIComponent(
    locale === "hi" ? `${title} — ContentVerse pe padho` : `${title} — on ContentVerse`
  );

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Share
        </span>
        <div className="inline-flex rounded-full border border-border/60 p-0.5">
          {(["en", "hi"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase transition",
                locale === code
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {code}
            </button>
          ))}
        </div>
        {imageUrl ? (
          <span className="hidden sm:inline text-[10px] text-muted-foreground">
            Preview uses cover image
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`https://wa.me/?text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on WhatsApp"
        >
          <Button variant="outline" size="icon" aria-label="Share on WhatsApp">
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
          </Button>
        </a>
        <a
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on Telegram"
        >
          <Button variant="outline" size="icon" aria-label="Share on Telegram">
            <Send className="h-4 w-4 text-[#2AABEE]" />
          </Button>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${tweetText}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="icon" aria-label="Share on X">
            <Twitter className="h-4 w-4" />
          </Button>
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="icon" aria-label="Share on LinkedIn">
            <Linkedin className="h-4 w-4" />
          </Button>
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="icon" aria-label="Share on Facebook">
            <Facebook className="h-4 w-4" />
          </Button>
        </a>
        <Button variant="outline" size="icon" onClick={onCopy} aria-label="Copy link">
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
