import Link from "next/link";
import Image from "next/image";
import { shouldSkipImageOptimization } from "@/lib/upload";
import { redirect } from "next/navigation";
import { Edit3, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";
import type { DashboardBlogRow } from "@/lib/data/blog-db";
import { formatNumber, timeAgo } from "@/lib/utils";

const STATUS_VARIANTS: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  PUBLISHED: "success",
  PENDING: "warning",
  DRAFT: "secondary",
  REJECTED: "destructive",
};

function Row({ blog }: { blog: DashboardBlogRow }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:border-neon-purple/40 transition-colors">
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
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
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={STATUS_VARIANTS[blog.status]}>{blog.status}</Badge>
          <span className="text-xs text-muted-foreground">{timeAgo(blog.publishedAt)}</span>
        </div>
        <Link href={`/blog/${blog.slug}`}>
          <h3 className="font-semibold truncate hover:text-foreground mt-1">{blog.title}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          {formatNumber(blog.views)} views · {formatNumber(blog.likes)} likes ·{" "}
          {formatNumber(blog.comments)} comments
        </p>
      </div>
      <div className="hidden md:flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="View" asChild>
          <Link href={`/blog/${blog.slug}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit" asChild>
          <Link href={`/dashboard/blogs/${blog.id}/edit`}>
            <Edit3 className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="More">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default async function MyBlogs() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard/blogs");

  const data = await getDashboardDataCached(session);
  const rows = data?.allBlogs ?? [];

  const tabs = [
    { value: "all", label: "All" },
    { value: "PUBLISHED", label: "Published" },
    { value: "PENDING", label: "Pending" },
    { value: "DRAFT", label: "Drafts" },
    { value: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            My Blogs
          </h1>
          <p className="text-muted-foreground mt-1">
            {rows.length} {rows.length === 1 ? "post" : "posts"} — only your content is shown here.
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button variant="gradient">New Blog</Button>
        </Link>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => {
          const filtered =
            t.value === "all" ? rows : rows.filter((r) => r.status === t.value);
          return (
            <TabsContent key={t.value} value={t.value} className="space-y-3">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
                  Nothing here yet.
                </div>
              ) : (
                filtered.map((b) => <Row key={b.id + t.value} blog={b} />)
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
