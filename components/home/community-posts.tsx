"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AUTHORS } from "@/lib/data/blogs";
import { getInitials } from "@/lib/utils";

const POSTS = [
  {
    author: AUTHORS[0],
    content:
      "Hot take: the best content this year isn't on legacy media. It's solo creators with newsletters of 8K people and conviction.",
    likes: 412,
    comments: 38,
    reposts: 64,
    time: "2h",
  },
  {
    author: AUTHORS[2],
    content:
      "Just hit $30K MRR with 3 people, 1 product and zero paid acquisition. Writing the full breakdown this weekend.",
    likes: 1_240,
    comments: 184,
    reposts: 312,
    time: "5h",
    tag: "founders",
  },
  {
    author: AUTHORS[3],
    content:
      "Design rule I'm leaning on this year — if the page can survive without the gradient, it doesn't need the gradient.",
    likes: 318,
    comments: 22,
    reposts: 41,
    time: "8h",
  },
  {
    author: AUTHORS[5],
    content:
      "Reading more, posting less. Best quarter for my brain in two years. There's a writer hidden in every reader.",
    likes: 502,
    comments: 47,
    reposts: 78,
    time: "1d",
  },
];

export function CommunityPosts() {
  return (
    <section className="container py-12 md:py-20">
      <div className="text-center mb-10">
        <span className="text-sm font-semibold uppercase tracking-widest text-neon-cyan">
          Community
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
          Short reads, sharp takes
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mt-3">
          What creators are dropping today — micro essays, breakdowns and arguments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {POSTS.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl border bg-card hover:border-neon-purple/40 hover:shadow-neon transition-all"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={p.author.avatar} alt={p.author.name} />
                <AvatarFallback>{getInitials(p.author.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{p.author.name}</p>
                  <p className="text-xs text-muted-foreground">@{p.author.username} · {p.time}</p>
                  {p.tag && <Badge variant="neon" className="text-[10px]">#{p.tag}</Badge>}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                  {p.content}
                </p>
                <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1.5 hover:text-neon-pink transition-colors">
                    <Heart className="h-4 w-4" /> {p.likes}
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-neon-blue transition-colors">
                    <MessageCircle className="h-4 w-4" /> {p.comments}
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-neon-green transition-colors">
                    <Repeat2 className="h-4 w-4" /> {p.reposts}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
