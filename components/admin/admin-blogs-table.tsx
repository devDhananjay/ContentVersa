"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/utils";
import type { AdminBlogRow } from "@/lib/data/admin-data";

const STATUS_VARIANT: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  PUBLISHED: "success",
  PENDING: "warning",
  DRAFT: "secondary",
  REJECTED: "destructive",
  ARCHIVED: "secondary",
};

function BlogTable({ rows }: { rows: AdminBlogRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-10 text-center">No blogs in this tab.</p>
    );
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <table className="w-full">
        <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground bg-muted/40">
          <tr>
            <th className="p-4">Post</th>
            <th className="p-4">Author</th>
            <th className="p-4">Status</th>
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
                <Link href={`/admin/users/${b.author.id}`} className="hover:underline">
                  <p className="font-medium">{b.author.name}</p>
                  <p className="text-xs text-muted-foreground">@{b.author.username}</p>
                </Link>
              </td>
              <td className="p-4">
                <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{b.status}</Badge>
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
  const [q, setQ] = React.useState("");
  const [deletingArchived, setDeletingArchived] = React.useState(false);

  const filter = (rows: AdminBlogRow[]) =>
    rows.filter(
      (b) =>
        b.title.toLowerCase().includes(q.toLowerCase()) ||
        b.author.name.toLowerCase().includes(q.toLowerCase()) ||
        b.author.email.toLowerCase().includes(q.toLowerCase())
    );

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
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, author, email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All ({filter(all).length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filter(pending).length})</TabsTrigger>
          <TabsTrigger value="published">Published ({filter(published).length})</TabsTrigger>
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
