"use client";

import * as React from "react";
import Script from "next/script";

const ADSENSE_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID?.trim();

type Props = {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
};

export function GoogleAdSense({
  slot,
  format = "auto",
  className,
}: Props) {
  const [ready, setReady] = React.useState(false);

  if (!ADSENSE_ID) return null;

  React.useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      /* ad blockers */
    }
  }, [ready]);

  return (
    <div className={className}>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
        onLoad={() => setReady(true)}
      />
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={slot || undefined}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
