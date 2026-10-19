import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type PageBackProps = {
  href: string;
  /** Destination name shown after “Back to …” */
  label: string;
  className?: string;
  /** Light text for dark hero overlays */
  tone?: "default" | "onDark";
};

/** Clear “Back to …” control used across hubs and detail pages. */
export function PageBack({
  href,
  label,
  className,
  tone = "default",
}: PageBackProps) {
  const onDark = tone === "onDark";
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 text-sm font-medium transition-colors",
        onDark
          ? "text-white/80 hover:text-white"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
          onDark
            ? "border-white/25 bg-black/25 backdrop-blur-sm group-hover:border-white/45 group-hover:bg-black/40"
            : "border-border/70 bg-card/70 group-hover:border-foreground/20 group-hover:bg-card"
        )}
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span>Back to {label}</span>
    </Link>
  );
}

export type PageCrumb = {
  href?: string;
  label: string;
};

type PageTrailProps = {
  back: { href: string; label: string };
  crumbs?: PageCrumb[];
  className?: string;
};

/** Back control plus optional breadcrumb row for nested pages. */
export function PageTrail({ back, crumbs, className }: PageTrailProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <PageBack href={back.href} label={back.label} />
      {crumbs && crumbs.length > 0 ? (
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
        >
          {crumbs.map((crumb, i) => (
            <span
              key={`${crumb.label}-${i}`}
              className="inline-flex items-center gap-2"
            >
              {i > 0 ? <span aria-hidden>/</span> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground line-clamp-1">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
