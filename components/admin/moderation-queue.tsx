"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Eye, MessageSquare, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, timeAgo } from "@/lib/utils";
import type { Blog } from "@/lib/data/blogs";

type QueueItem = Blog & { status: string; blogId: string };

function ReviewCard({ blog }: { blog: QueueItem }) {
  const router = useRouter();
  const [feedback, setFeedback] = React.useState("");
  const [loading, setLoading] = React.useState<"approve" | "reject" | "changes" | null>(null);

  const decide = async (decision: "APPROVED" | "REJECTED" | "REQUEST_CHANGES") => {
    setLoading(
      decision === "APPROVED" ? "approve" : decision === "REJECTED" ? "reject" : "changes"
    );
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId: blog.blogId, decision, feedback: feedback || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Action failed");
      }
      router.refresh();
      setTimeout(() => window.location.reload(), 150);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-3xl border bg-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
        <div className="relative aspect-[16/10] md:aspect-auto min-h-[120px] bg-muted">
          {blog.coverImage ? (
            <Image src={blog.coverImage} alt={blog.title} fill sizes="200px" className="object-cover" />
          ) : null}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={blog.status === "REJECTED" ? "destructive" : "warning"}>
              {blog.status}
            </Badge>
            <Badge variant="secondary">{blog.category}</Badge>
            <span className="text-xs text-muted-foreground">{timeAgo(blog.publishedAt)}</span>
          </div>
          <h3 className="font-display text-xl font-bold leading-snug">{blog.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{blog.excerpt}</p>

          <div className="mt-4 flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
              <AvatarFallback>{getInitials(blog.author.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{blog.author.name}</p>
              <p className="text-xs text-muted-foreground">@{blog.author.username}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <Textarea
              placeholder="Feedback for the writer (sent on reject/changes)…"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex md:flex-col gap-2">
              <Button variant="outline" className="gap-1.5" asChild>
                <Link href={`/admin/blogs/${blog.blogId}`}>
                  <Eye className="h-4 w-4" /> Full details
                </Link>
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                disabled={!!loading}
                onClick={() => decide("REQUEST_CHANGES")}
              >
                {loading === "changes" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
                Changes
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="destructive"
              className="gap-1.5"
              disabled={!!loading}
              onClick={() => decide("REJECTED")}
            >
              {loading === "reject" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Reject
            </Button>
            <Button
              variant="gradient"
              className="gap-1.5"
              disabled={!!loading}
              onClick={() => decide("APPROVED")}
            >
              {loading === "approve" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve & Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModerationQueue({
  pending,
  rejected,
}: {
  pending: QueueItem[];
  rejected: QueueItem[];
}) {
  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
        <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="pending" className="space-y-4">
        {pending.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            No posts waiting for review.
          </div>
        ) : (
          pending.map((b) => <ReviewCard key={b.blogId} blog={b} />)
        )}
      </TabsContent>
      <TabsContent value="rejected" className="space-y-4">
        {rejected.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            No rejected submissions.
          </div>
        ) : (
          rejected.map((b) => <ReviewCard key={b.blogId} blog={b} />)
        )}
      </TabsContent>
    </Tabs>
  );
}
