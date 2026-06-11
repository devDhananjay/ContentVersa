import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Eye, Film } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { getUserReels, getUserReelStats } from "@/lib/reels/data";
import { MyReelsClient } from "@/components/reels/my-reels-client";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

export default async function DashboardReelsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard/reels");

  const authorId = await requireUserId(session);
  const [reels, stats] = await Promise.all([
    getUserReels(authorId),
    getUserReelStats(authorId),
  ]);

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            My <span className="text-gradient">Reels</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Short videos and images — views update like Instagram.
          </p>
        </div>
        <Link href="/dashboard/reels/create">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" /> Create Reel
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total views"
          value={formatNumber(stats.totalViews)}
          delta={0}
          icon={<Eye className="h-5 w-5" />}
          color="from-neon-pink to-neon-purple"
          index={0}
        />
        <StatCard
          label="Views (30d)"
          value={formatNumber(stats.views30d)}
          delta={0}
          icon={<Eye className="h-5 w-5" />}
          color="from-neon-blue to-neon-cyan"
          index={1}
        />
        <StatCard
          label="Total reels"
          value={String(stats.totalReels)}
          delta={0}
          icon={<Film className="h-5 w-5" />}
          color="from-neon-orange to-neon-pink"
          index={2}
        />
      </div>

      <MyReelsClient initialRows={reels} />
    </div>
  );
}
