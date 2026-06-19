import Link from "next/link";
import Image from "next/image";
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

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2 shrink-0 min-w-0", className)}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          width={s.imageH * 3}
          height={s.imageH}
          className="h-auto w-auto max-h-10 object-contain"
          priority
          unoptimized
          aria-hidden
        />
      ) : (
        <ContentVerseMark size={s.icon} />
      )}
      <LogoText className={s.text} />
    </Link>
  );
}
