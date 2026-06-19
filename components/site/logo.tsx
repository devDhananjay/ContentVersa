import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: 36, text: "text-base", tagline: false },
    md: { icon: 44, text: "text-xl", tagline: false },
    lg: { icon: 52, text: "text-2xl", tagline: true },
  } as const;
  const s = sizes[size];

  return (
    <Link href="/" className={cn("group flex items-center gap-2.5 shrink-0", className)}>
      <Image
        src="/logo-icon.png"
        alt=""
        width={s.icon}
        height={s.icon}
        className="rounded-xl object-contain shrink-0"
        style={{ width: s.icon, height: s.icon }}
        priority
        aria-hidden
      />
      <div className="flex flex-col leading-none min-w-0">
        <span className={cn("font-display font-extrabold tracking-tight whitespace-nowrap", s.text)}>
          Content<span className="text-gradient">Verse</span>
        </span>
        {s.tagline && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1 hidden sm:block">
            Read · Create · Grow
          </span>
        )}
      </div>
    </Link>
  );
}
