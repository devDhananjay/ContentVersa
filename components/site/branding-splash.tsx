"use client";

import * as React from "react";
import Image from "next/image";
import { DEFAULT_LOGO_ICON } from "@/lib/branding/logo";
import { shouldSkipImageOptimization } from "@/lib/upload";

const GRADIENT_RING =
  "conic-gradient(from 0deg, #3B82F6, #A855F7, #C084FC, #60A5FA, #3B82F6)";

function GradientLoaderRing({
  children,
  size = 80,
  ringWidth = 5,
}: {
  children: React.ReactNode;
  size?: number;
  ringWidth?: number;
}) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full animate-spin motion-reduce:animate-none"
      style={{
        width: size,
        height: size,
        background: GRADIENT_RING,
        padding: ringWidth,
      }}
      aria-hidden
    >
      <div className="flex h-full w-full items-center justify-center rounded-full bg-transparent">
        <div className="animate-[spin_1s_linear_infinite_reverse] motion-reduce:animate-none">
          {children}
        </div>
      </div>
    </div>
  );
}

export function BrandingSplash() {
  const [visible, setVisible] = React.useState(true);
  const [loaderUrl, setLoaderUrl] = React.useState<string | null>(null);
  const [logoUrl, setLogoUrl] = React.useState(DEFAULT_LOGO_ICON);

  React.useEffect(() => {
    let cancelled = false;

    void fetch("/api/site/branding")
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: {
            assets?: { loader?: { current?: string | null } };
            logoUrl?: string;
          } | null
        ) => {
          if (cancelled) return;
          setLoaderUrl(data?.assets?.loader?.current ?? null);
          if (data?.logoUrl) setLogoUrl(data.logoUrl);
        }
      )
      .catch(() => undefined);

    const hide = () => {
      window.setTimeout(() => {
        if (!cancelled) setVisible(false);
      }, 350);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent pointer-events-none"
      role="status"
      aria-label="Loading ContentVerse"
    >
      {loaderUrl ? (
        <GradientLoaderRing size={84} ringWidth={5}>
          <Image
            src={loaderUrl}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            unoptimized
            priority
          />
        </GradientLoaderRing>
      ) : (
        <GradientLoaderRing size={76} ringWidth={5}>
          <Image
            src={logoUrl}
            alt=""
            width={38}
            height={38}
            className="h-[38px] w-[38px] rounded-[22%] object-contain"
            unoptimized={shouldSkipImageOptimization(logoUrl)}
            priority
          />
        </GradientLoaderRing>
      )}
    </div>
  );
}
