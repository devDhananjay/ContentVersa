"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AUTHORS } from "@/lib/data/blogs";
import { getInitials, timeAgo } from "@/lib/utils";

interface Comment {
  id: string;
  author: typeof AUTHORS[number];
  content: string;
  createdAt: string;
  likes: number;
}

const SEED_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: AUTHORS[1],
    content:
      "This is exactly the framing I needed. Sharing with my team — we've been stuck in funnel-think for two quarters.",
    createdAt: "2026-05-10",
    likes: 28,
  },
  {
    id: "c2",
    author: AUTHORS[3],
    content:
      "Top tier post. One more thing worth adding: rituals matter more than tools. The same tools you used last year, used differently this year, can change everything.",
    createdAt: "2026-05-11",
    likes: 41,
  },
];

export function Comments() {
  const [comments, setComments] = React.useState<Comment[]>(SEED_COMMENTS);
  const [draft, setDraft] = React.useState("");

  const onPost = () => {
    if (!draft.trim()) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      author: AUTHORS[0],
      content: draft.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    setComments((c) => [newComment, ...c]);
    setDraft("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MessageCircle className="h-4 w-4" /> {comments.length} Comments
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What's on your mind? Drop a thoughtful comment…"
          className="min-h-[100px] resize-none border-0 focus-visible:ring-0 p-0"
        />
        <div className="flex justify-end mt-3 pt-3 border-t border-border/40">
          <Button variant="gradient" onClick={onPost} disabled={!draft.trim()} className="gap-1.5">
            <Send className="h-4 w-4" /> Post
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex gap-3 rounded-2xl border bg-card p-4"
          >
            <Avatar>
              <AvatarImage src={c.author.avatar} alt={c.author.name} />
              <AvatarFallback>{getInitials(c.author.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{c.author.name}</p>
                <p className="text-xs text-muted-foreground">@{c.author.username} · {timeAgo(c.createdAt)}</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{c.content}</p>
              <div className="mt-3 flex items-center gap-4 text-xs">
                <button className="flex items-center gap-1.5 text-muted-foreground hover:text-neon-pink transition-colors">
                  <Heart className="h-3.5 w-3.5" /> {c.likes}
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  Reply
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
