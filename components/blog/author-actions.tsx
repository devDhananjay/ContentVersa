"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/profile/follow-button";
import { formatNumber, getInitials } from "@/lib/utils";

export type AuthorActionsProps = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  bio?: string;
  followers?: number;
  blogs?: number;
  avatarSize?: "sm" | "md" | "lg";
  layout?: "row" | "card";
};

export function AuthorActions({
  id,
  name,
  username,
  avatar,
  verified,
  bio,
  followers = 0,
  blogs = 0,
  avatarSize = "md",
  layout = "row",
}: AuthorActionsProps) {
  const avatarClass =
    avatarSize === "lg"
      ? "h-16 w-16"
      : avatarSize === "sm"
        ? "h-10 w-10"
        : "h-12 w-12";

  if (layout === "card") {
    return (
      <div className="flex flex-col md:flex-row items-start gap-4">
        <Link href={`/profile/${username}`} className="shrink-0">
          <Avatar className={`${avatarClass} border-2 border-border hover:ring-2 hover:ring-neon-purple/40`}>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${username}`} className="hover:underline inline-flex items-center gap-1.5">
            <p className="font-display text-lg font-bold">{name}</p>
            {verified && <BadgeCheck className="h-4 w-4 text-neon-cyan" />}
          </Link>
          <p className="text-sm text-muted-foreground">
            {formatNumber(followers)} followers · {blogs} blogs
          </p>
          {bio && <p className="mt-2 text-sm text-foreground/90">{bio}</p>}
        </div>
        <FollowButton
          username={username}
          targetUserId={id}
          initialFollowerCount={followers}
          className="shrink-0"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/profile/${username}`} className="shrink-0">
        <Avatar className={`${avatarClass} border-2 border-border hover:ring-2 hover:ring-neon-purple/40`}>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/profile/${username}`} className="hover:underline inline-flex items-center gap-1.5">
          <span className="font-semibold">{name}</span>
          {verified && <BadgeCheck className="h-4 w-4 text-neon-cyan" />}
        </Link>
      </div>
      <FollowButton
        username={username}
        targetUserId={id}
        initialFollowerCount={followers}
        className="shrink-0"
      />
    </div>
  );
}
