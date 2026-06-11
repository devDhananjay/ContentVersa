"use client";

import Link from "next/link";
import { Eye, Film, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";
import type { ReelDashboardRow } from "@/lib/reels/types";
import { ReelsLibraryStrip } from "@/components/reels/reels-library-strip";

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

        <ReelsLibraryStrip reels={reels} showManageLink />
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

