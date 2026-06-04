"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Heart, Loader2, CornerDownRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getInitials, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CommentItem } from "@/components/blog/comments";

type CommentRowProps = {
  comment: CommentItem;
  isReply?: boolean;
  replyTo: string | null;
  replyDraft: string;
  posting: boolean;
  onReplyDraftChange: (value: string) => void;
  onReplyToChange: (id: string | null) => void;
  onPostReply: (content: string, parentId: string) => void;
  onToggleLike: (commentId: string) => void;
};

export function CommentRow({
  comment: c,
  isReply = false,
  replyTo,
  replyDraft,
  posting,
  onReplyDraftChange,
  onReplyToChange,
  onPostReply,
  onToggleLike,
}: CommentRowProps) {
  const isReplying = replyTo === c.id;

  return (
    <motion.div
      className={cn(
        "flex gap-3 rounded-2xl border bg-card p-4",
        isReply && "ml-8 md:ml-12 border-dashed"
      )}
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={c.author.avatar} alt={c.author.name} />
        <AvatarFallback>{getInitials(c.author.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-sm">{c.author.name}</p>
          <p className="text-xs text-muted-foreground">
            @{c.author.username} · {timeAgo(c.createdAt)}
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">{c.content}</p>
        <div className="mt-3 flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => onToggleLike(c.id)}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              c.likedByMe
                ? "text-neon-pink"
                : "text-muted-foreground hover:text-neon-pink"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", c.likedByMe && "fill-current")} /> {c.likes}
          </button>
          {!isReply && (
            <button
              type="button"
              onClick={() => {
                onReplyToChange(isReplying ? null : c.id);
                if (!isReplying) onReplyDraftChange("");
              }}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <CornerDownRight className="h-3.5 w-3.5" /> Reply
            </button>
          )}
        </div>
        {isReplying && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyDraft}
              onChange={(e) => onReplyDraftChange(e.target.value)}
              placeholder={`Reply to @${c.author.username}…`}
              className="min-h-[72px] text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="gradient"
                disabled={posting || !replyDraft.trim()}
                onClick={() => onPostReply(replyDraft, c.id)}
              >
                {posting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Post reply"
                )}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onReplyToChange(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        {c.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {c.replies.map((r) => (
              <CommentRow
                key={r.id}
                comment={r}
                isReply
                replyTo={replyTo}
                replyDraft={replyDraft}
                posting={posting}
                onReplyDraftChange={onReplyDraftChange}
                onReplyToChange={onReplyToChange}
                onPostReply={onPostReply}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
