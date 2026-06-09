"use client";

import Link from "next/link";
import { Eye, Film, Heart, Play, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";
import type { ReelDashboardRow } from "@/lib/reels/types";

type ReelsStats = {
  totalViews: number;
  totalReels: number;
  publishedReels: number;
  views30d: number;
};

interface ReelsDashboardPanelProps {
  reels: ReelDashboardRow[];
  stats: ReelsStats;
}

export function ReelsDashboardPanel({ reels, stats }: ReelsDashboardPanelProps) {
  return (
    <section className="rounded-2xl border border-border/50 bg-gradient-to-b from-neon-pink/5 via-muted/10 to-transparent overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border/40 bg-gradient-to-r from-neon-pink/10 via-neon-purple/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center shadow-lg shadow-neon-pink/20">
            <Film className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg">My Reels</h2>
              <Badge variant="outline" className="text-[10px] h-5 border-neon-pink/30 text-neon-pink">
                {stats.publishedReels} live
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Short videos & images — share like Instagram
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/reels">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Watch feed
            </Button>
          </Link>
          <Link href="/dashboard/reels/create">
            <Button variant="gradient" size="sm" className="h-8 text-xs gap-1.5 shadow-neon">
              <Plus className="h-3.5 w-3.5" /> Create Reel
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Total views"
            value={formatNumber(stats.totalViews)}
            icon={<Eye className="h-4 w-4" />}
            gradient="from-neon-blue/20 to-neon-cyan/10"
          />
          <StatCard
            label="Views (30d)"
            value={formatNumber(stats.views30d)}
            icon={<Sparkles className="h-4 w-4" />}
            gradient="from-neon-purple/20 to-neon-pink/10"
          />
          <StatCard
            label="Total reels"
            value={String(stats.totalReels)}
            icon={<Film className="h-4 w-4" />}
            gradient="from-neon-orange/20 to-neon-pink/10"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your library
            </p>
            {reels.length > 0 && (
              <Link href="/dashboard/reels" className="text-xs text-neon-pink hover:underline">
                Manage all →
              </Link>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            <CreateReelCard />
            {reels.map((reel) => (
              <DashboardReelCard key={reel.id} reel={reel} />
            ))}
          </div>

          {reels.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-xl mt-2">
              No reels yet — tap <strong>Create</strong> to upload your first one
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border/40 p-3 bg-gradient-to-br", gradient)}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display text-2xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

function CreateReelCard() {
  return (
    <Link
      href="/dashboard/reels/create"
      className="shrink-0 group flex flex-col items-center gap-2 w-[130px]"
    >
      <div className="relative w-[130px] h-[220px] rounded-2xl border-2 border-dashed border-neon-pink/40 bg-gradient-to-br from-neon-pink/10 via-neon-purple/5 to-transparent flex flex-col items-center justify-center gap-2 group-hover:border-neon-pink/70 group-hover:shadow-lg group-hover:shadow-neon-pink/10 transition-all">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center shadow-lg">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <span className="text-xs font-semibold text-foreground">Create Reel</span>
        <span className="text-[10px] text-muted-foreground px-3 text-center leading-tight">
          Video or image
        </span>
      </div>
    </Link>
  );
}

function DashboardReelCard({ reel }: { reel: ReelDashboardRow }) {
  const thumb = reel.thumbnailUrl || reel.mediaUrl;
  const isLive = reel.status === "PUBLISHED";
  const href = isLive ? `/reels/${reel.id}` : "/dashboard/reels";

  return (
    <Link href={href} className="shrink-0 group w-[130px]">
      <div className="relative w-[130px] h-[220px] rounded-2xl overflow-hidden bg-muted border border-border/50 shadow-md group-hover:ring-2 group-hover:ring-neon-pink/50 transition-all">
        {reel.mediaType === "VIDEO" ? (
          <video
            src={reel.mediaUrl}
            poster={thumb}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {reel.mediaType === "VIDEO" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-5 w-5 text-white fill-white" />
          </div>
        )}

        <Badge
          className={cn(
            "absolute top-2 left-2 text-[9px] h-5 border-0",
            isLive ? "bg-emerald-500/90" : "bg-amber-500/90"
          )}
        >
          {isLive ? "Live" : reel.status}
        </Badge>

        <div className="absolute bottom-0 inset-x-0 p-2.5">
          <p className="text-[10px] text-white/90 line-clamp-2 leading-snug mb-1.5">
            {reel.caption}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-white font-medium">
            <span className="flex items-center gap-0.5">
              <Eye className="h-3 w-3" />
              {formatNumber(reel.views)}
            </span>
            <span className="flex items-center gap-0.5">
              <Heart className="h-3 w-3" />
              {formatNumber(reel.likesCount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
