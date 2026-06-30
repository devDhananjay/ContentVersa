import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ContentVerseMark } from "@/components/icons/contentverse-mark";
import { resolveSiteLogo } from "@/lib/branding/logo";

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

export function Logo({
  className,
  size = "md",
  imageUrl,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  imageUrl?: string | null;
}) {
  const sizes = {
    sm: { icon: 32, text: "text-lg", imageH: 32 },
    md: { icon: 36, text: "text-xl", imageH: 36 },
    lg: { icon: 44, text: "text-3xl", imageH: 44 },
  } as const;
  const s = sizes[size];
  const markSrc = resolveSiteLogo(imageUrl);

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2 shrink-0 min-w-0", className)}
    >
      {markSrc ? (
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neon-purple/30 bg-[#0a0a0f]">
          <Image
            src={markSrc}
            alt=""
            width={36}
            height={36}
            className="h-full w-full object-contain p-0.5"
            priority
            unoptimized
            aria-hidden
          />
        </span>
      ) : (
        <ContentVerseMark size={s.icon} />
      )}
      <LogoText className={s.text} />
    </Link>
  );
}
