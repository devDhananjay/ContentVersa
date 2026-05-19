import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { dot: "h-6 w-6", text: "text-base" },
    md: { dot: "h-8 w-8", text: "text-xl" },
    lg: { dot: "h-10 w-10", text: "text-2xl" },
  } as const;
  const s = sizes[size];
  return (
    <Link href="/" className={cn("group flex items-center gap-2", className)}>
      <div className="relative">
        <div
          className={cn(
            "rounded-xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink",
            s.dot,
            "shadow-neon"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink blur-md opacity-50 transition-opacity group-hover:opacity-80",
            s.dot
          )}
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn("font-display font-extrabold tracking-tight", s.text)}>
          Content<span className="text-gradient">Verse</span>
        </span>
        {size === "lg" && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
            Read · Create · Grow
          </span>
        )}
      </div>
    </Link>
  );
}
