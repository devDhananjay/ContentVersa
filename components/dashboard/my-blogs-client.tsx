"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Eye,
  MoreHorizontal,
  Trash2,
  Link2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shouldSkipImageOptimization } from "@/lib/upload";
import type { DashboardBlogRow } from "@/lib/data/blog-db";
import { formatNumber, timeAgo } from "@/lib/utils";

const STATUS_VARIANTS: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  PUBLISHED: "success",
  PENDING: "warning",
  DRAFT: "secondary",
  REJECTED: "destructive",
};

const TABS = [
  { value: "all", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "PENDING", label: "Pending" },
  { value: "DRAFT", label: "Drafts" },
  { value: "REJECTED", label: "Rejected" },
] as const;

function BlogRow({
  blog,
  onDeleted,
}: {
  blog: DashboardBlogRow;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);
  const isPublic = blog.status === "PUBLISHED";
  const viewHref = `/blog/${blog.slug}`;
  const editHref = `/dashboard/blogs/${blog.id}/edit`;

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${blog.slug}`
      : `/blog/${blog.slug}`;

  const copyLink = async () => {
    if (!isPublic) {
      toast.message("Draft is private — only you can open this link while signed in.");
    }
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const deleteBlog = async () => {
    const ok = window.confirm(
      `Delete “${blog.title}”? This cannot be undone.`
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/blogs/mine/${encodeURIComponent(blog.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed");
      onDeleted(blog.id);
      toast.success("Blog deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete blog");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:border-neon-purple/40 transition-colors">
      <Link href={viewHref} className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        {blog.coverImage ? (
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized={shouldSkipImageOptimization(blog.coverImage)}
          />
        ) : null}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={STATUS_VARIANTS[blog.status]}>{blog.status}</Badge>
          {blog.scheduledFor ? (
            <Badge variant="neon" className="text-[10px]">
              Scheduled{" "}
              {new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(blog.scheduledFor))}
            </Badge>
          ) : null}
          <span className="text-xs text-muted-foreground">{timeAgo(blog.publishedAt)}</span>
        </div>
        <Link href={viewHref}>
          <h3 className="font-semibold truncate hover:text-neon-purple mt-1">{blog.title}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          {isPublic
            ? `${formatNumber(blog.views)} views · ${formatNumber(blog.likes)} likes · ${formatNumber(blog.comments)} comments`
            : blog.scheduledFor
              ? "Will auto-publish at the scheduled time"
              : "Private preview — click title or eye to view"}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" aria-label={isPublic ? "View" : "Preview"} asChild>
          <Link href={viewHref} target="_blank">
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit" asChild>
          <Link href={editHref}>
            <Edit3 className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete blog"
          disabled={deleting}
          onClick={deleteBlog}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={viewHref} target="_blank" className="cursor-pointer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {isPublic ? "View article" : "Preview draft"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={editHref} className="cursor-pointer">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit blog
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
              <Link2 className="h-4 w-4 mr-2" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={deleteBlog}
              disabled={deleting}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function MyBlogsClient({ initialRows }: { initialRows: DashboardBlogRow[] }) {
  const [rows, setRows] = React.useState(initialRows);

  React.useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const counts = React.useMemo(() => {
    const c = {
      all: rows.length,
      PUBLISHED: 0,
      PENDING: 0,
      DRAFT: 0,
      REJECTED: 0,
    };
    for (const r of rows) {
      if (r.status in c) c[r.status as keyof typeof c] += 1;
    }
    return c;
  }, [rows]);

  return (
    <Tabs defaultValue="all">
      <TabsList className="flex-wrap h-auto gap-1">
        {TABS.map((t) => {
          const n = t.value === "all" ? counts.all : counts[t.value];
          return (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label} ({n})
            </TabsTrigger>
          );
        })}
      </TabsList>
      {TABS.map((t) => {
        const filtered =
          t.value === "all" ? rows : rows.filter((r) => r.status === t.value);
        return (
          <TabsContent key={t.value} value={t.value} className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
                Nothing here yet.
              </div>
            ) : (
              filtered.map((b) => (
                <BlogRow key={b.id} blog={b} onDeleted={removeRow} />
              ))
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
