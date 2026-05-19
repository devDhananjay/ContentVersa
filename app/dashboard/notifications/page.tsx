"use client";

import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Heart,
  MessageCircle,
  ThumbsUp,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NOTIFS = [
  {
    icon: CheckCircle2,
    title: "Your blog was approved",
    body: "‘The Shipping Mindset’ is now live on ContentVerse.",
    color: "text-green-500 bg-green-500/10",
    time: "2m",
    unread: true,
  },
  {
    icon: UserPlus,
    title: "Zara Khan followed you",
    body: "@zaracodes is following you.",
    color: "text-neon-blue bg-neon-blue/10",
    time: "12m",
    unread: true,
  },
  {
    icon: Heart,
    title: "1.2K new reactions",
    body: "Your post is trending in #ai-agents.",
    color: "text-neon-pink bg-neon-pink/10",
    time: "1h",
    unread: true,
  },
  {
    icon: MessageCircle,
    title: "Riya commented",
    body: "“This is exactly the framing I needed.”",
    color: "text-neon-purple bg-neon-purple/10",
    time: "3h",
    unread: false,
  },
  {
    icon: ThumbsUp,
    title: "Achievement unlocked",
    body: "‘Top 5% creator’ this week.",
    color: "text-neon-orange bg-neon-orange/10",
    time: "1d",
    unread: false,
  },
  {
    icon: XCircle,
    title: "Submission needs changes",
    body: "Your draft needs a stronger thesis. Feedback inside.",
    color: "text-destructive bg-destructive/10",
    time: "2d",
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            Notifications
            <Badge variant="pink" className="rounded-full">3 new</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Everything happening across your work.
          </p>
        </div>
        <Button variant="outline" size="sm">Mark all read</Button>
      </div>

      <div className="space-y-3">
        {NOTIFS.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "flex items-start gap-4 p-4 rounded-2xl border bg-card hover:border-neon-purple/40 transition-colors",
              n.unread && "ring-1 ring-neon-purple/30"
            )}
          >
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", n.color)}>
              <n.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{n.title}</p>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
            </div>
            {n.unread && <div className="h-2 w-2 rounded-full bg-neon-pink shrink-0 mt-2" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
