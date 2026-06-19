"use client";

import * as React from "react";
import { Twitter, Linkedin, Link2, Facebook, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

export function ShareBar({
  url,
  title,
  imageUrl,
}: {
  url: string;
  title: string;
  imageUrl?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  const waText = encodeURIComponent(
    imageUrl ? `${title}\n${url}` : `${title} — ${url}`
  );
  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on WhatsApp"
      >
        <Button variant="outline" size="icon" aria-label="Share on WhatsApp">
          <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
        </Button>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon" aria-label="Share on X">
          <Twitter className="h-4 w-4" />
        </Button>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon" aria-label="Share on LinkedIn">
          <Linkedin className="h-4 w-4" />
        </Button>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon" aria-label="Share on Facebook">
          <Facebook className="h-4 w-4" />
        </Button>
      </a>
      <Button variant="outline" size="icon" onClick={onCopy} aria-label="Copy link">
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
