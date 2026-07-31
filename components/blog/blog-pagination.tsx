import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function BlogPagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") next.set(k, v);
    }
    if (p > 1) next.set("page", String(p));
    const qs = next.toString();
    return qs ? `/blogs?${qs}` : "/blogs";
  };

  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, windowStart + 4);
  const pages: number[] = [];
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="Article pages"
    >
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full border px-3 text-sm transition-colors",
          page <= 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-muted"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors",
            p === page
              ? "border-foreground bg-foreground text-background"
              : "hover:bg-muted"
          )}
        >
          {p}
        </Link>
      ))}

      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full border px-3 text-sm transition-colors",
          page >= totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-muted"
        )}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
