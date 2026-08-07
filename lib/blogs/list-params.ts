export const BLOG_PAGE_SIZE_DEFAULT = 18;
export const BLOG_PAGE_SIZE_MAX = 50;
export const BLOG_PAGE_SIZE_OPTIONS = [12, 18, 24, 36, 50] as const;

export type BlogListSearchParams = Record<string, string | undefined>;

export function parseBlogPageSize(raw?: string): number {
  const n = Number.parseInt(raw || "", 10);
  if (!Number.isFinite(n) || n < 1) return BLOG_PAGE_SIZE_DEFAULT;
  return Math.min(BLOG_PAGE_SIZE_MAX, Math.max(1, n));
}

export function buildBlogListHref(
  searchParams: BlogListSearchParams,
  overrides: { page?: number; limit?: number } = {}
): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (!v || k === "page" || k === "limit") continue;
    next.set(k, v);
  }

  const limit = overrides.limit ?? parseBlogPageSize(searchParams.limit);
  if (limit !== BLOG_PAGE_SIZE_DEFAULT) {
    next.set("limit", String(limit));
  }

  const page = overrides.page ?? 1;
  if (page > 1) next.set("page", String(page));

  const qs = next.toString();
  return qs ? `/blogs?${qs}` : "/blogs";
}
