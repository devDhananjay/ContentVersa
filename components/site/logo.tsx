import Link from "next/link";
import { cn } from "@/lib/utils";
import { ContentVerseMark } from "@/components/icons/contentverse-mark";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: 32, text: "text-base" },
    md: { icon: 36, text: "text-lg" },
    lg: { icon: 44, text: "text-2xl" },
  } as const;
  const s = sizes[size];

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2 shrink-0 min-w-0", className)}
    >
      <ContentVerseMark size={s.icon} />
      <span
        className={cn(
          "font-display font-extrabold tracking-tight whitespace-nowrap leading-none",
          s.text
        )}
      >
        Content<span className="text-gradient">Verse</span>
      </span>
    </Link>
  );
}
