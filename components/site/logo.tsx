import Link from "next/link";
import { cn } from "@/lib/utils";
import { ContentVerseMark } from "@/components/icons/contentverse-mark";

function LogoText({ className }: { className: string }) {
  return (
    <span
      className={cn(
        "font-display font-extrabold tracking-tight whitespace-nowrap leading-none",
        className
      )}
    >
      Content<span className="text-gradient">Verse</span>
    </span>
  );
}

/** Site logo — always the official ContentVerse mark + wordmark (ignores admin uploads). */
export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
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
      <ContentVerseMark size={s.icon} />
      <LogoText className={s.text} />
    </Link>
  );
}
