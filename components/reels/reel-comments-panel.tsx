"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";
import type { ReelCommentDto } from "@/lib/reels/comments";

interface ReelCommentsPanelProps {
  reelId: string;
  open: boolean;
  onClose: () => void;
  initialCount?: number;
  onCountChange?: (count: number) => void;
}

export function ReelCommentsPanel({
  reelId,
  open,
  onClose,
  initialCount = 0,
  onCountChange,
}: ReelCommentsPanelProps) {
  const [comments, setComments] = React.useState<ReelCommentDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [posting, setPosting] = React.useState(false);
  const [authRequired, setAuthRequired] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const onCountChangeRef = React.useRef(onCountChange);

  React.useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reels/${reelId}/comments`, { credentials: "include" });
      const data = (await res.json()) as { data?: ReelCommentDto[] };
      const list = data.data || [];
      setComments(list);
      onCountChangeRef.current?.(list.length);
    } finally {
      setLoading(false);
    }
  }, [reelId]);

  React.useEffect(() => {
    if (open) {
      void load();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, load]);

  const postComment = async () => {
    const text = draft.trim();
    if (!text || posting) return;
    setPosting(true);
    setAuthRequired(false);
    try {
      const res = await fetch(`/api/reels/${reelId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = (await res.json()) as { comment?: ReelCommentDto; error?: string };
      if (res.status === 401) {
        setAuthRequired(true);
        return;
      }
      if (!res.ok || !data.comment) {
        throw new Error(data.error || "Failed");
      }
      setComments((prev) => {
        const next = [data.comment!, ...prev];
        onCountChangeRef.current?.(next.length);
        return next;
      });
      setDraft("");
    } catch {
      /* toast optional */
    } finally {
      setPosting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="absolute inset-x-0 bottom-0 z-50 max-h-[70%] rounded-t-3xl bg-background border-t border-border/50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <div>
                <h3 className="font-display font-bold text-sm">Comments</h3>
                <p className="text-[11px] text-muted-foreground">
                  {comments.length || initialCount} total
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-[200px]">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">
                  No comments yet. Start the conversation.
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <Avatar className="h-8 w-8 shrink-0">
                      {c.author.avatar ? (
                        <AvatarImage src={c.author.avatar} alt={c.author.name} />
                      ) : null}
                      <AvatarFallback className="text-[10px]">
                        {getInitials(c.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">
                        @{c.author.username}
                        <span className="font-normal text-muted-foreground ml-2">
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                        </span>
                      </p>
                      <p className="text-sm mt-0.5 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-border/40 bg-background/95">
              {authRequired ? (
                <p className="text-center text-sm text-muted-foreground py-2">
                  <Link href="/auth/sign-in" className="text-neon-pink font-semibold hover:underline">
                    Sign in
                  </Link>{" "}
                  to comment
                </p>
              ) : (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void postComment();
                  }}
                >
                  <Input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Add a comment…"
                    maxLength={500}
                    className="rounded-full bg-muted/50 border-0"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="gradient"
                    disabled={!draft.trim() || posting}
                    className="shrink-0 rounded-full h-10 w-10"
                  >
                    {posting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
