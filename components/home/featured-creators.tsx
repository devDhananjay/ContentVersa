"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, ArrowRight, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/profile/follow-button";
import type { Author } from "@/lib/data/blogs";
import { formatNumber, getInitials } from "@/lib/utils";

interface Props {
  creators: Author[];
}

export function FeaturedCreators({ creators }: Props) {
  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-neon-blue mb-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-widest">
                Featured Creators
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
              The writers
              <br />
              <span className="text-gradient">building this space.</span>
            </h2>
          </div>
          <Link href="/leaderboard" className="hidden md:block">
            <Button variant="outline" className="gap-2">
              All creators <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {creators.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ y: -4 }}
              className="group relative p-5 rounded-2xl border bg-card hover:border-neon-purple/40 hover:shadow-neon transition-all"
            >
              <Link href={`/profile/${c.username}`} className="block text-center">
                <div className="relative mx-auto">
                  <div className="absolute inset-0 mx-auto rounded-full bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink blur opacity-40 group-hover:opacity-80 transition-opacity h-16 w-16" />
                  <Avatar className="relative h-16 w-16 mx-auto border-2 border-background">
                    {c.avatar ? <AvatarImage src={c.avatar} alt={c.name} /> : null}
                    <AvatarFallback>{getInitials(c.name)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <p className="font-semibold text-sm truncate">{c.name}</p>
                  {c.verified && <BadgeCheck className="h-4 w-4 text-neon-cyan shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">@{c.username}</p>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-snug min-h-[2lh]">
                  {c.bio || "Creator on ContentVerse"}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {c.blogs > 0
                      ? `${c.blogs} ${c.blogs === 1 ? "post" : "posts"}`
                      : `${formatNumber(c.followers)} followers`}
                  </Badge>
                </div>
              </Link>
              <FollowButton
                username={c.username}
                targetUserId={c.id}
                initialFollowerCount={c.followers}
                className="mt-3 w-full"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
