"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, X, Eye, Flag, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BLOGS } from "@/lib/data/blogs";
import { getInitials, timeAgo } from "@/lib/utils";

const QUEUE = BLOGS.slice(0, 5).map((b, i) => ({
  ...b,
  status: (["PENDING", "PENDING", "PENDING", "FLAGGED", "PENDING"] as const)[i],
}));

function ReviewCard({ blog }: { blog: (typeof QUEUE)[number] }) {
  const [feedback, setFeedback] = React.useState("");
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border bg-card overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
        <div className="relative aspect-[16/10] md:aspect-auto">
          <Image src={blog.coverImage} alt={blog.title} fill sizes="200px" className="object-cover" />
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={blog.status === "FLAGGED" ? "destructive" : "warning"}>
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
              <p className="text-xs text-muted-foreground">@{blog.author.username} · {blog.author.followers} followers</p>
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
              <Button variant="outline" className="gap-1.5">
                <Eye className="h-4 w-4" /> Preview
              </Button>
              <Button variant="outline" className="gap-1.5">
                <MessageSquare className="h-4 w-4" /> Changes
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button variant="destructive" className="gap-1.5">
              <X className="h-4 w-4" /> Reject
            </Button>
            <Button variant="gradient" className="gap-1.5">
              <Check className="h-4 w-4" /> Approve & Publish
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ModerationPage() {
  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Moderation queue
          </h1>
          <p className="text-muted-foreground mt-1">
            Approve or reject blog submissions before they go public.
          </p>
        </div>
        <Button variant="outline" className="gap-1.5">
          <Flag className="h-4 w-4" /> Bulk actions
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending (4)</TabsTrigger>
          <TabsTrigger value="flagged">Flagged (1)</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          {QUEUE.filter((q) => q.status === "PENDING").map((b) => (
            <ReviewCard key={b.id} blog={b} />
          ))}
        </TabsContent>
        <TabsContent value="flagged" className="space-y-4">
          {QUEUE.filter((q) => q.status === "FLAGGED").map((b) => (
            <ReviewCard key={b.id} blog={b} />
          ))}
        </TabsContent>
        <TabsContent value="approved">
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            Approved items live in the public feed.
          </div>
        </TabsContent>
        <TabsContent value="rejected">
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            Rejected items shown here with reviewer notes.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
