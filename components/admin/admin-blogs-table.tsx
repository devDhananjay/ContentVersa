"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminListFilters, useAdminFilters } from "@/components/admin/admin-list-filters";
import { formatNumber } from "@/lib/utils";
import {
  formatAdminDate,
  inDateRange,
  matchesSearch,
} from "@/lib/admin/list-filters";
import type { AdminBlogRow } from "@/lib/data/admin-data";

const STATUS_VARIANT: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  PUBLISHED: "success",
  PENDING: "warning",
  DRAFT: "secondary",
  REJECTED: "destructive",
  ARCHIVED: "secondary",
};

const FILTER_DEFAULTS = {
  q: "",
  category: "all",
  dateField: "createdAt",
  dateFrom: "",
  dateTo: "",
  sort: "newest",
};

type BlogFilters = typeof FILTER_DEFAULTS;

function sortBlogs(rows: AdminBlogRow[], sort: string): AdminBlogRow[] {
  const copy = [...rows];
  switch (sort) {
    case "oldest":
      return copy.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "views":
      return copy.sort((a, b) => b.views - a.views);
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "published":
      return copy.sort((a, b) => {
        const ap = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bp = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return bp - ap;
      });
    case "scheduled":
      return copy.sort((a, b) => {
        const ap = a.scheduledFor ? new Date(a.scheduledFor).getTime() : Number.MAX_SAFE_INTEGER;
        const bp = b.scheduledFor ? new Date(b.scheduledFor).getTime() : Number.MAX_SAFE_INTEGER;
        return ap - bp;
      });
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

function applyBlogFilters(rows: AdminBlogRow[], f: BlogFilters): AdminBlogRow[] {
  const filtered = rows.filter((b) => {
    if (
      !matchesSearch(
        f.q,
        b.title,
        b.slug,
        b.author.name,
        b.author.username,
        b.author.email,
        b.category
      )
    ) {
      return false;
    }
    if (f.category !== "all" && (b.category ?? "") !== f.category) return false;
    const dateVal =
      f.dateField === "publishedAt" ? b.publishedAt : b.createdAt;
    if (!inDateRange(dateVal, f.dateFrom, f.dateTo)) return false;
    return true;
  });
  return sortBlogs(filtered, f.sort);
}

function BlogTable({ rows }: { rows: AdminBlogRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-10 text-center">No blogs match your filters.</p>
    );
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[960px]">
        <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground bg-muted/40">
          <tr>
            <th className="p-4">Post</th>
            <th className="p-4">Category</th>
            <th className="p-4">Author</th>
            <th className="p-4">Status</th>
            <th className="p-4">Created (IST)</th>
            <th className="p-4">Scheduled (IST)</th>
            <th className="p-4">Published (IST)</th>
            <th className="p-4">Views</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} className="border-t border-border/40 text-sm hover:bg-muted/20">
              <td className="p-4">
                <Link href={`/admin/blogs/${b.id}`} className="flex items-center gap-3 group">
                  <div className="relative h-12 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                    {b.coverImage ? (
                      <Image src={b.coverImage} alt="" fill sizes="64px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate group-hover:text-orange-500 transition-colors">
                      {b.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{b.excerpt || "—"}</p>
                  </div>
                </Link>
              </td>
              <td className="p-4">
                {b.category ? (
                  <Badge variant="secondary" className="text-[10px]">
                    {b.category}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="p-4">
                <Link href={`/admin/users/${b.author.id}`} className="hover:underline">
                  <p className="font-medium">{b.author.name}</p>
                  <p className="text-xs text-muted-foreground">@{b.author.username}</p>
                </Link>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1 items-start">
                  <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{b.status}</Badge>
                  {b.scheduledFor ? (
                    <Badge variant="neon" className="text-[10px]">
                      Scheduled
                    </Badge>
                  ) : null}
                </div>
              </td>
              <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                {formatAdminDate(b.createdAt)}
              </td>
              <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                {formatAdminDate(b.scheduledFor)}
              </td>
              <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                {formatAdminDate(b.publishedAt)}
              </td>
              <td className="p-4 font-semibold">{formatNumber(b.views)}</td>
              <td className="p-4 text-right">
                <Link href={`/admin/blogs/${b.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminBlogsTable({
  all,
  pending,
  published,
  rejected,
  draft,
  archived,
}: {
  all: AdminBlogRow[];
  pending: AdminBlogRow[];
  published: AdminBlogRow[];
  rejected: AdminBlogRow[];
  draft: AdminBlogRow[];
  archived: AdminBlogRow[];
}) {
  const router = useRouter();
  const { filters, set, clear, hasActive } = useAdminFilters(FILTER_DEFAULTS);
  const [deletingArchived, setDeletingArchived] = React.useState(false);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    for (const b of all) {
      if (b.category) set.add(b.category);
    }
    return [...set].sort();
  }, [all]);

  const filter = (rows: AdminBlogRow[]) => applyBlogFilters(rows, filters);
  const scheduled = React.useMemo(
    () =>
      all
        .filter((b) => b.scheduledFor)
        .sort(
          (a, b) =>
            new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime()
        ),
    [all]
  );
  const filteredScheduled = filter(scheduled);
  const filteredArchived = filter(archived);

  const deleteAllArchived = async () => {
    if (filteredArchived.length === 0) return;

    const confirmed = window.confirm(
      `Permanently delete all ${filteredArchived.length} archived blog(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingArchived(true);
    try {
      const res = await fetch("/api/admin/blogs/archived", {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string; deleted?: number };
      if (!res.ok) {
        toast.error(data.error || "Could not delete archived blogs");
        return;
      }
      toast.success(`Deleted ${data.deleted ?? 0} archived blog(s)`);
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setDeletingArchived(false);
    }
  };

  return (
    <div>
      <AdminListFilters
        search={{
          value: filters.q,
          onChange: (v) => set("q", v),
          placeholder: "Search title, slug, author, email…",
        }}
        dateFrom={{ value: filters.dateFrom, onChange: (v) => set("dateFrom", v) }}
        dateTo={{ value: filters.dateTo, onChange: (v) => set("dateTo", v) }}
        selects={[
          {
            id: "category",
            value: filters.category,
            onChange: (v) => set("category", v),
            placeholder: "Category",
            options: [
              { value: "all", label: "All categories" },
              ...categories.map((c) => ({ value: c, label: c })),
            ],
          },
          {
            id: "dateField",
            value: filters.dateField,
            onChange: (v) => set("dateField", v),
            placeholder: "Date field",
            options: [
              { value: "createdAt", label: "Created date" },
              { value: "publishedAt", label: "Published date" },
            ],
          },
          {
            id: "sort",
            value: filters.sort,
            onChange: (v) => set("sort", v),
            placeholder: "Sort by",
            options: [
              { value: "newest", label: "Newest created" },
              { value: "oldest", label: "Oldest created" },
              { value: "published", label: "Recently published" },
              { value: "scheduled", label: "Soonest scheduled" },
              { value: "views", label: "Most views" },
              { value: "title", label: "Title A–Z" },
            ],
            className: "w-[180px]",
          },
        ]}
        resultCount={filter(all).length}
        showClear={hasActive}
        onClear={clear}
      />

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All ({filter(all).length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filter(pending).length})</TabsTrigger>
          <TabsTrigger value="published">Published ({filter(published).length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({filteredScheduled.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filter(rejected).length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({filter(draft).length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({filteredArchived.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <BlogTable rows={filter(all)} />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <BlogTable rows={filter(pending)} />
        </TabsContent>
        <TabsContent value="published" className="mt-4">
          <BlogTable rows={filter(published)} />
        </TabsContent>
        <TabsContent value="scheduled" className="mt-4 space-y-3">
          {filteredScheduled.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Auto-publish when the scheduled time is reached (cron every 10 min, IST).
            </p>
          ) : null}
          <BlogTable rows={filteredScheduled} />
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          <BlogTable rows={filter(rejected)} />
        </TabsContent>
        <TabsContent value="draft" className="mt-4">
          <BlogTable rows={filter(draft)} />
        </TabsContent>
        <TabsContent value="archived" className="mt-4 space-y-4">
          {filteredArchived.length > 0 ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {filteredArchived.length} archived post(s) — hidden from public site.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 shrink-0"
                disabled={deletingArchived}
                onClick={deleteAllArchived}
              >
                {deletingArchived ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete all archived
              </Button>
            </div>
          ) : null}
          <BlogTable rows={filteredArchived} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
