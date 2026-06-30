import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DEFAULT_LOGO_ICON } from "@/lib/branding/logo";
import { shouldSkipImageOptimization } from "@/lib/upload";

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

/** Site logo — icon image + wordmark. Pass the same `src` everywhere for consistency. */
export function Logo({
  src = DEFAULT_LOGO_ICON,
  className,
  size = "md",
}: {
  src?: string;
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
      <Image
        src={src}
        alt="ContentVerse"
        width={s.icon}
        height={s.icon}
        className="shrink-0 rounded-[22%] object-contain"
        unoptimized={shouldSkipImageOptimization(src)}
        priority
      />
      <LogoText className={s.text} />
    </Link>
  );
}
