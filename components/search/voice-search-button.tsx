"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type VoiceSearchButtonProps = {
  supported: boolean;
  listening: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md";
};

/** Vidyora-style voice mic control for search fields. */
export function VoiceSearchButton({
  supported,
  listening,
  onToggle,
  className,
  size = "sm",
}: VoiceSearchButtonProps) {
  if (!supported) return null;

  const dim = size === "md" ? "size-10" : "size-9";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={listening ? "Stop voice search" : "Search with voice"}
      aria-pressed={listening}
      title={listening ? "Listening… tap to stop" : "Voice search"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition",
        listening && "bg-primary/10 ring-2 ring-primary/25",
        dim,
        className
      )}
    >
      <Image
        src="/brand/voice-search-icon.png"
        alt=""
        width={36}
        height={36}
        draggable={false}
        className={cn(
          "size-[90%] object-contain",
          listening && "animate-pulse"
        )}
      />
    </button>
  );
}
