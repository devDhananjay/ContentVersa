"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Thumbnail that hides itself if the remote image fails (common with gstatic Trends URLs). */
export function TrendThumb({
  src,
  alt = "",
  className,
  imgClassName,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
}) {
  const [ok, setOk] = React.useState(Boolean(src));

  React.useEffect(() => {
    setOk(Boolean(src));
  }, [src]);

  if (!src || !ok) {
    return (
      <div
        className={cn("bg-gradient-to-br from-orange-500/20 to-pink-500/10", className)}
        aria-hidden
      />
    );
  }

  return (
    <div className={cn("overflow-hidden bg-muted", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", imgClassName)}
        loading="lazy"
        referrerPolicy="no-referrer"
        decoding="async"
        onError={() => setOk(false)}
      />
    </div>
  );
}
