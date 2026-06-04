"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentRow } from "@/components/blog/comment-row";

export type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  likes: number;
  likedByMe: boolean;
  parentId: string | null;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  replies: CommentItem[];
};

export function Comments({
  blogSlug,
  initialCount = 0,
}: {
  blogSlug: string;
  initialCount?: number;
}) {
  const [comments, setComments] = React.useState<CommentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [draft, setDraft] = React.useState("");
  const [posting, setPosting] = React.useState(false);
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [replyDraft, setReplyDraft] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [authRequired, setAuthRequired] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/blogs/${encodeURIComponent(blogSlug)}/comments`,
        { credentials: "include" }
      );
      const data = (await res.json()) as { data?: CommentItem[] };
      setComments(data.data || []);
    } finally {
      setLoading(false);
    }
  }, [blogSlug]);

  React.useEffect(() => {
    load();
  }, [load]);

  const postComment = async (content: string, parentId?: string) => {
    setError(null);
    setPosting(true);
    try {
      const res = await fetch(
        `/api/blogs/${encodeURIComponent(blogSlug)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content, parentId }),
        }
      );
      const data = (await res.json()) as {
        error?: string;
        comment?: CommentItem;
      };
      if (res.status === 401) {
        setAuthRequired(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to post");

      if (parentId && data.comment) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...c.replies, data.comment!] }
              : c
          )
        );
        setReplyTo(null);
        setReplyDraft("");
      } else if (data.comment) {
        setComments((prev) => [data.comment!, ...prev]);
        setDraft("");
      } else {
        await load();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (commentId: string) => {
    try {
      const res = await fetch(
        `/api/blogs/${encodeURIComponent(blogSlug)}/comments/${commentId}/like`,
        { method: "POST", credentials: "include" }
      );
      if (res.status === 401) {
        setAuthRequired(true);
        return;
      }
      const data = (await res.json()) as { liked?: boolean };
      const update = (list: CommentItem[]): CommentItem[] =>
        list.map((c) => {
          if (c.id === commentId) {
            const liked = data.liked ?? !c.likedByMe;
            return {
              ...c,
              likedByMe: liked,
              likes: c.likes + (liked && !c.likedByMe ? 1 : !liked && c.likedByMe ? -1 : 0),
            };
          }
          return { ...c, replies: update(c.replies) };
        });
      setComments(update);
    } catch {
      /* ignore */
    }
  };

  const total =
    comments.length +
    comments.reduce((s, c) => s + c.replies.length, 0) ||
    initialCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MessageCircle className="h-4 w-4" /> {total} Comments
      </div>

      {authRequired && (
        <p className="text-sm rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2">
          <Link href="/auth/sign-in" className="font-medium underline">
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      <div className="rounded-2xl border bg-card p-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What's on your mind? Drop a thoughtful comment…"
          className="min-h-[100px] resize-none border-0 focus-visible:ring-0 p-0"
        />
        <div className="flex justify-end mt-3 pt-3 border-t border-border/40">
          <Button
            variant="gradient"
            onClick={() => postComment(draft)}
            disabled={posting || !draft.trim()}
            className="gap-1.5"
          >
            {posting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}{" "}
            Post
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              replyTo={replyTo}
              replyDraft={replyDraft}
              posting={posting}
              onReplyDraftChange={setReplyDraft}
              onReplyToChange={setReplyTo}
              onPostReply={postComment}
              onToggleLike={toggleLike}
            />
          ))}
          {comments.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Be the first to start the conversation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
