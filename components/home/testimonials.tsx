"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const TESTIMONIALS = [
  {
    quote:
      "I moved my entire writing practice here. The editor doesn't fight me, the audience is real, and the platform actually pays.",
    name: "Aarav Mehta",
    role: "Builder · 48K followers",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Aarav",
  },
  {
    quote:
      "ContentVerse feels like the platform we always wanted as creators. Premium aesthetic, serious tools, no algorithmic guesswork.",
    name: "Zara Khan",
    role: "Engineer + Writer",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Zara",
  },
  {
    quote:
      "Hit 12K followers in 3 months without playing games. Just wrote what I actually believed.",
    name: "Maya Iyer",
    role: "Essayist",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Maya",
  },
];

export function Testimonials() {
  return (
    <section className="container py-12 md:py-20">
      <div className="text-center mb-10">
        <span className="text-sm font-semibold uppercase tracking-widest text-neon-cyan">
          Loved by creators
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
          What people who actually <span className="text-gradient">use it</span> say
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative p-6 rounded-2xl border bg-card flex flex-col"
          >
            <Quote className="h-8 w-8 text-neon-purple/30 mb-4" />
            <p className="text-base text-foreground/90 leading-relaxed flex-1">
              &quot;{t.quote}&quot;
            </p>
            <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border/50">
              <Avatar>
                <AvatarImage src={t.avatar} alt={t.name} />
                <AvatarFallback>{getInitials(t.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
