"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Eye, Loader2, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, timeAgo } from "@/lib/utils";
import type { AdminReelQueueItem } from "@/lib/data/admin-data";

function ReelReviewCard({ reel }: { reel: AdminReelQueueItem }) {
  const router = useRouter();
  const [feedback, setFeedback] = React.useState("");
  const [loading, setLoading] = React.useState<"approve" | "reject" | null>(null);
  const thumb = reel.thumbnailUrl || reel.mediaUrl;

  const decide = async (decision: "APPROVED" | "REJECTED") => {
    setLoading(decision === "APPROVED" ? "approve" : "reject");
    try {
      const res = await fetch("/api/admin/reels-moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reelId: reel.id, decision, feedback: feedback || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Action failed");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-3xl border bg-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[140px_1fr]">
        <div className="relative aspect-[9/16] md:aspect-auto min-h-[200px] bg-muted">
          {reel.mediaType === "VIDEO" ? (
            <video
              src={reel.mediaUrl}
              poster={thumb}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              controls
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={reel.status === "REJECTED" ? "destructive" : "warning"}>
              {reel.status}
            </Badge>
            <Badge variant="secondary">{reel.mediaType}</Badge>
            <span className="text-xs text-muted-foreground">{timeAgo(reel.createdAt.toISOString())}</span>
          </div>
          <p className="text-sm leading-relaxed line-clamp-4">{reel.caption}</p>

          <div className="mt-4 flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={reel.author.image ?? undefined} alt={reel.author.name} />
              <AvatarFallback>{getInitials(reel.author.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{reel.author.name}</p>
              <p className="text-xs text-muted-foreground">@{reel.author.username}</p>
            </div>
          </div>

          <div className="mt-4">
            <Textarea
              placeholder="Feedback for the creator (sent on reject)…"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[72px]"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" className="gap-1.5" asChild>
              <Link href={reel.status === "PUBLISHED" ? `/reels/${reel.id}` : `/dashboard/reels`}>
                <Eye className="h-4 w-4" /> Preview
              </Link>
            </Button>
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

export function ReelModerationQueue({
  pending,
  rejected,
}: {
  pending: AdminReelQueueItem[];
  rejected: AdminReelQueueItem[];
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
            <Film className="h-8 w-8 mx-auto mb-3 opacity-50" />
            No reels waiting for review.
          </div>
        ) : (
          pending.map((reel) => <ReelReviewCard key={reel.id} reel={reel} />)
        )}
      </TabsContent>
      <TabsContent value="rejected" className="space-y-4">
        {rejected.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            No rejected reels.
          </div>
        ) : (
          rejected.map((reel) => <ReelReviewCard key={reel.id} reel={reel} />)
        )}
      </TabsContent>
    </Tabs>
  );
}
