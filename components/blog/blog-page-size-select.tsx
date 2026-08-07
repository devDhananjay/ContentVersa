"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BLOG_PAGE_SIZE_OPTIONS,
  buildBlogListHref,
  type BlogListSearchParams,
} from "@/lib/blogs/list-params";

export function BlogPageSizeSelect({
  value,
  searchParams,
}: {
  value: number;
  searchParams: BlogListSearchParams;
}) {
  const router = useRouter();
  const selected = BLOG_PAGE_SIZE_OPTIONS.includes(
    value as (typeof BLOG_PAGE_SIZE_OPTIONS)[number]
  )
    ? String(value)
    : String(
        BLOG_PAGE_SIZE_OPTIONS.reduce((best, n) =>
          Math.abs(n - value) < Math.abs(best - value) ? n : best
        )
      );

  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span className="whitespace-nowrap">Per page</span>
      <Select
        value={selected}
        onValueChange={(v) => {
          const limit = Number.parseInt(v, 10);
          router.push(buildBlogListHref(searchParams, { page: 1, limit }));
        }}
      >
        <SelectTrigger className="h-9 w-[5.5rem] text-sm" aria-label="Articles per page">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BLOG_PAGE_SIZE_OPTIONS.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
