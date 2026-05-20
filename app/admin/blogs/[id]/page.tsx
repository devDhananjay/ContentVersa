import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlogModerationActions } from "@/components/admin/blog-moderation-actions";
import { renderMarkdown } from "@/components/blog/markdown";
import { getAdminBlogDetail } from "@/lib/data/admin-data";
import { formatNumber, getInitials } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  PUBLISHED: "success",
  PENDING: "warning",
  DRAFT: "secondary",
  REJECTED: "destructive",
};

export default async function AdminBlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = await getAdminBlogDetail(id);
  if (!blog) notFound();

  return (
    <div className="container py-8 max-w-4xl">
      <Link href="/admin/blogs">
        <Button variant="ghost" size="sm" className="gap-1.5 mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4" /> All blogs
        </Button>
      </Link>

      {blog.coverImage && (
        <div className="relative aspect-[16/7] rounded-3xl overflow-hidden border mb-8">
          <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={STATUS_VARIANT[blog.status] ?? "secondary"}>{blog.status}</Badge>
        {blog.category && <Badge variant="secondary">{blog.category}</Badge>}
        {blog.isPremium && <Badge variant="pink">Premium</Badge>}
        {blog.tags.map((t) => (
          <Badge key={t} variant="outline">
            #{t}
          </Badge>
        ))}
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
        {blog.title}
      </h1>
      {blog.excerpt && (
        <p className="text-lg text-muted-foreground mt-3">{blog.excerpt}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" /> {formatNumber(blog.views)} views
        </span>
        <span className="flex items-center gap-1">
          <Heart className="h-4 w-4" /> {formatNumber(blog.likesCount)} likes
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" /> {formatNumber(blog.commentsCount)} comments
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" /> {blog.readingTime} min read
        </span>
      </div>

      <Link
        href={`/admin/users/${blog.author.id}`}
        className="mt-6 flex items-center gap-3 p-4 rounded-2xl border bg-card hover:border-orange-500/40 transition-colors w-fit"
      >
        <Avatar className="h-11 w-11">
          <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
          <AvatarFallback>{getInitials(blog.author.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" /> Author
          </p>
          <p className="font-semibold">{blog.author.name}</p>
          <p className="text-xs text-muted-foreground">
            @{blog.author.username} · {blog.author.email}
          </p>
        </div>
      </Link>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {[
          { label: "Created", value: blog.createdAt.toLocaleString() },
          { label: "Updated", value: blog.updatedAt.toLocaleString() },
          {
            label: "Published",
            value: blog.publishedAt ? blog.publishedAt.toLocaleString() : "—",
          },
          { label: "Slug", value: blog.slug },
        ].map((row) => (
          <div key={row.label} className="rounded-xl border bg-card p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{row.label}</p>
            <p className="font-medium mt-1 break-all text-xs">{row.value}</p>
          </div>
        ))}
      </div>

      {blog.submission && (
        <div className="mt-6 rounded-2xl border bg-card p-5 space-y-3">
          <h2 className="font-display text-lg font-bold">Approval history</h2>
          <p className="text-sm">
            Queue decision:{" "}
            <Badge variant="secondary">{blog.submission.decision}</Badge>
            {blog.submission.reviewedAt && (
              <span className="text-muted-foreground ml-2">
                · {blog.submission.reviewedAt.toLocaleString()}
              </span>
            )}
          </p>
          {blog.submission.feedback && (
            <p className="text-sm text-muted-foreground border-l-2 pl-3 border-orange-500">
              {blog.submission.feedback}
            </p>
          )}
          {blog.rejectionNote && (
            <p className="text-sm text-destructive">Rejection note: {blog.rejectionNote}</p>
          )}
          {blog.submission.reviews.length > 0 && (
            <ul className="space-y-2 mt-2">
              {blog.submission.reviews.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground border-t pt-2">
                  <span className="font-medium text-foreground">{r.reviewer.name || r.reviewer.username}</span>{" "}
                  — {r.decision}
                  {r.note ? `: ${r.note}` : ""} · {r.createdAt.toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <BlogModerationActions blogId={blog.id} status={blog.status} />

      <div className="mt-8 flex flex-wrap gap-2">
        {blog.status === "PUBLISHED" && (
          <Link href={`/blog/${blog.slug}`} target="_blank">
            <Button variant="gradient" className="gap-1.5">
              <ExternalLink className="h-4 w-4" /> View live post
            </Button>
          </Link>
        )}
        <Link href={`/admin/users/${blog.author.id}`}>
          <Button variant="outline">View author profile</Button>
        </Link>
      </div>

      <div className="mt-10 rounded-3xl border bg-card p-6 md:p-10">
        <h2 className="font-display text-xl font-bold mb-6">Full content</h2>
        {blog.content ? renderMarkdown(blog.content) : (
          <p className="text-muted-foreground">No content.</p>
        )}
      </div>
    </div>
  );
}
