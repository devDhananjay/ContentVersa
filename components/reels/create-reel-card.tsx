"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type CreateReelCardProps = {
  className?: string;
  variant?: "strip" | "library";
};

const VARIANTS = {
  strip: {
    width: 88,
    height: 150,
    radiusClass: "rounded-[var(--reel-preview-radius)]",
    icon: "h-10 w-10",
    plus: "h-5 w-5",
    title: "text-[10px]",
    subtitle: "text-[8px]",
    gap: "gap-1",
  },
  library: {
    width: 130,
    height: 220,
    radiusClass: "rounded-2xl",
    icon: "h-12 w-12",
    plus: "h-6 w-6",
    title: "text-[11px]",
    subtitle: "text-[9px]",
    gap: "gap-1.5",
  },
} as const;

export function CreateReelCardLink({
  className,
  variant = "strip",
}: CreateReelCardProps) {
  const v = VARIANTS[variant];

  return (
    <Link
      href="/dashboard/reels/create"
      className={cn("shrink-0 group block", className)}
      style={{ width: v.width }}
    >
      <div
        className={cn(
          v.radiusClass,
          "relative border-2 border-dashed border-neon-pink/55",
          "bg-[#0a0a0c] flex flex-col items-center justify-center overflow-hidden",
          "group-hover:border-neon-pink/80 group-hover:shadow-md group-hover:shadow-neon-pink/10 transition-all",
          v.gap
        )}
        style={{ width: v.width, height: v.height }}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-neon-purple/25 blur-2xl" />
          <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-neon-pink/20 blur-2xl" />
        </div>

        <div className={cn("relative z-10 flex flex-col items-center px-2 text-center", v.gap)}>
          <div
            className={cn(
              v.icon,
              "rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center shadow-md shadow-neon-pink/30"
            )}
          >
            <Plus className={cn(v.plus, "text-white stroke-[2.5]")} />
          </div>
          <span className={cn(v.title, "font-semibold text-white leading-tight")}>Create Reel</span>
          <span className={cn(v.subtitle, "text-muted-foreground leading-tight")}>Video or image</span>
        </div>
      </div>
    </Link>
  );
}
