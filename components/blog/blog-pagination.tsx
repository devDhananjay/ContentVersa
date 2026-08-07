import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlogPageSizeSelect } from "@/components/blog/blog-page-size-select";
import {
  BLOG_PAGE_SIZE_DEFAULT,
  buildBlogListHref,
  type BlogListSearchParams,
} from "@/lib/blogs/list-params";

function pageItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let i = current - 2; i <= current + 2; i++) {
    if (i >= 1 && i <= total) set.add(i);
  }
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) set.add(i);
  }
  if (current >= total - 3) {
    for (let i = total - 4; i <= total; i++) set.add(i);
  }

  const sorted = [...set].sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]!;
    if (i > 0 && n - sorted[i - 1]! > 1) items.push("ellipsis");
    items.push(n);
  }
  return items;
}

export function BlogPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  searchParams,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  searchParams: BlogListSearchParams;
}) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const hrefFor = (p: number) =>
    buildBlogListHref(searchParams, { page: p, limit: pageSize });

  const pages = pageItems(page, totalPages);

  return (
    <div className="mt-10 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {start}–{end}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">{totalItems}</span>{" "}
          {totalItems === 1 ? "article" : "articles"}
          {totalPages > 1 ? (
            <>
              {" "}
              · Page{" "}
              <span className="font-medium text-foreground">{page}</span> of{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </>
          ) : null}
        </p>
        <BlogPageSizeSelect
          value={pageSize || BLOG_PAGE_SIZE_DEFAULT}
          searchParams={searchParams}
        />
      </div>

      {totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-center gap-1.5"
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

          {pages.map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`e-${idx}`}
                className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-sm text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Link
                key={item}
                href={hrefFor(item)}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors",
                  item === page
                    ? "border-foreground bg-foreground text-background"
                    : "hover:bg-muted"
                )}
              >
                {item}
              </Link>
            )
          )}

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
      ) : null}
    </div>
  );
}
