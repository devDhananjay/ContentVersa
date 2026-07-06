"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DEFAULT_LOGO_ICON } from "@/lib/branding/logo";
import { shouldSkipImageOptimization } from "@/lib/upload";

function LogoText({
  className,
  immersive,
}: {
  className: string;
  immersive?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-display font-extrabold tracking-tight whitespace-nowrap leading-none",
        immersive ? "text-white" : undefined,
        className
      )}
    >
      Content
      <span
        className={cn(
          immersive
            ? "bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent"
            : "text-gradient"
        )}
      >
        Verse
      </span>
    </span>
  );
}

/** Site logo — icon image + wordmark. Pass the same `src` everywhere for consistency. */
export function Logo({
  src: initialSrc = DEFAULT_LOGO_ICON,
  className,
  size = "md",
  immersive = false,
}: {
  src?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  immersive?: boolean;
}) {
  const [src, setSrc] = React.useState(initialSrc);

  React.useEffect(() => {
    setSrc(initialSrc);
  }, [initialSrc]);

  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 44, text: "text-3xl" },
  } as const;
  const s = sizes[size];

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2 shrink-0 min-w-0", className)}
    >
      <Image
        src={src}
        alt="ContentVerse"
        width={s.icon}
        height={s.icon}
        className="shrink-0 rounded-[22%] object-contain"
        unoptimized={shouldSkipImageOptimization(src)}
        priority
        onError={() => {
          if (src !== DEFAULT_LOGO_ICON) setSrc(DEFAULT_LOGO_ICON);
        }}
      />
      <LogoText className={s.text} immersive={immersive} />
    </Link>
  );
}
