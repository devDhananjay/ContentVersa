import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const heights = { sm: 32, md: 40, lg: 52 } as const;
  const h = heights[size];

  return (
    <Link href="/" className={cn("group flex items-center shrink-0", className)}>
      <Image
        src="/logo.png"
        alt="ContentVerse — Read. Create. Grow."
        width={h}
        height={h}
        className="rounded-lg object-contain"
        style={{ width: "auto", height: h }}
        priority
      />
    </Link>
  );
}
