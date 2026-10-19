"use client";

import Link from "next/link";
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

function CreatorCard({ c }: { c: Author }) {
  return (
    <div
      className="v2-raised v2-lift group relative shrink-0 p-2.5 sm:p-3"
      style={{ width: "calc((100cqi - 1.5rem) / 3)" }}
    >
      <Link href={`/profile/${c.username}`} className="block text-center">
        <Avatar className="mx-auto h-9 w-9 border-2 border-background shadow-sm sm:h-10 sm:w-10">
          {c.avatar ? <AvatarImage src={c.avatar} alt={c.name} /> : null}
          <AvatarFallback className="text-[10px]">{getInitials(c.name)}</AvatarFallback>
        </Avatar>
        <div className="mt-1.5 flex items-center justify-center gap-0.5">
          <p className="truncate text-xs font-semibold leading-tight sm:text-[13px]">
            {c.name}
          </p>
          {c.verified ? (
            <BadgeCheck className="h-3 w-3 shrink-0 text-primary sm:h-3.5 sm:w-3.5" />
          ) : null}
        </div>
        <p className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
          @{c.username}
        </p>
        <div className="mt-1.5 flex items-center justify-center">
          <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">
            {c.blogs > 0
              ? `${c.blogs} ${c.blogs === 1 ? "post" : "posts"}`
              : `${formatNumber(c.followers)} fol.`}
          </Badge>
        </div>
      </Link>
      <FollowButton
        username={c.username}
        targetUserId={c.id}
        initialFollowerCount={c.followers}
        className="mt-2 w-full [&_button]:h-7 [&_button]:min-w-0 [&_button]:w-full [&_button]:gap-1 [&_button]:px-1.5 [&_button]:text-[11px] [&_button_svg]:h-3 [&_button_svg]:w-3"
      />
    </div>
  );
}

/** ~3 compact cards visible; remaining creators auto-scroll in a loop. */
export function FeaturedCreators({ creators }: Props) {
  if (!creators.length) return null;

  const loop = [...creators, ...creators];

  return (
    <section
      id="featured-creators"
      className="scroll-mt-[calc(var(--site-header-offset)+1rem)] border-y border-border/60 bg-muted/40"
    >
      <div className="container py-10 md:py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="v2-eyebrow inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Featured Creators
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight md:text-3xl">
              The writers{" "}
              <span className="text-gradient italic">building this space.</span>
            </h2>
          </div>
          <Link href="/leaderboard" className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-2 rounded-full">
              All creators <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div
          className="relative overflow-hidden [contain:paint]"
          style={{ containerType: "inline-size" }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-muted/40 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-muted/40 to-transparent" />

          <div className="flex w-max gap-3 animate-marquee-creators hover:[animation-play-state:paused] motion-reduce:animate-none">
            {loop.map((c, i) => (
              <CreatorCard key={`${c.id}-${i}`} c={c} />
            ))}
          </div>
        </div>

        <div className="mt-5 sm:hidden">
          <Link href="/leaderboard">
            <Button variant="gradient" size="sm" className="w-full gap-2">
              All creators <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
