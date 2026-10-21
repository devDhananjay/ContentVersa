import Image from "next/image";
import { DEFAULT_LOGO_ICON } from "@/lib/branding/logo";
import { cn } from "@/lib/utils";

/**
 * ContentVerse badge over the top-right of news covers — hides residual TOI marks.
 */
export function CoverBrandBadge({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const box =
    size === "sm"
      ? "h-6 w-11"
      : size === "lg"
        ? "h-10 w-[4.5rem]"
        : "h-8 w-14";

  return (
    <span
      className={cn(
        "pointer-events-none absolute right-2 top-2 z-[1] overflow-hidden rounded-md bg-black/80 shadow-sm ring-1 ring-white/10",
        box,
        className
      )}
      aria-hidden
    >
      <Image
        src={DEFAULT_LOGO_ICON}
        alt=""
        fill
        sizes="72px"
        className="object-contain p-0.5"
      />
    </span>
  );
}
