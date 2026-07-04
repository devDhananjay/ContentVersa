"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, MessageCircle, Mail, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openHelpChat } from "@/components/help/help-chat-widget";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    icon: Brain,
    title: "Daily Quiz",
    desc: "Test yourself & earn streak points",
    href: "/#daily-quiz",
    accent: "text-neon-cyan",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    desc: "See top readers & creators",
    href: "/leaderboard",
    accent: "text-amber-400",
  },
  {
    icon: MessageCircle,
    title: "Need help?",
    desc: "Site guide — blogs, reels, finance",
    action: "chat" as const,
    accent: "text-neon-purple",
  },
  {
    icon: Mail,
    title: "Newsletter",
    desc: "Weekly picks — opt in only",
    href: "/#newsletter",
    accent: "text-neon-pink",
  },
];

export function StayEngagedStrip() {
  return (
    <section className="container py-10 md:py-14">
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/15 px-5 py-6 md:px-8 md:py-8">
        <div className="mb-5 md:mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-neon-purple">
            Keep exploring
          </p>
          <h2 className="font-display text-xl md:text-2xl font-bold mt-1">
            Stay on ContentVerse — there&apos;s always something next
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            const inner = (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 18 } }}
                className="h-full rounded-xl border border-border/60 bg-card/80 p-4 hover:border-neon-purple/40 hover:shadow-lg hover:shadow-neon-purple/10 transition-colors"
              >
                <Icon className={cn("h-5 w-5 mb-2", card.accent)} />
                <p className="font-semibold text-sm">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
              </motion.div>
            );

            if (card.action === "chat") {
              return (
                <button
                  key={card.title}
                  type="button"
                  className="text-left h-full"
                  onClick={() => openHelpChat()}
                >
                  {inner}
                </button>
              );
            }

            return (
              <Link key={card.title} href={card.href!} className="block h-full">
                {inner}
              </Link>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/blogs">Explore blogs</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/reels">Watch reels</Link>
          </Button>
          <Button variant="gradient" size="sm" onClick={() => openHelpChat()}>
            <MessageCircle className="h-4 w-4" />
            Ask help bot
          </Button>
        </div>
      </div>
    </section>
  );
}
