import { redirect } from "next/navigation";
import { BarChart3, Eye, Heart, Clock, TrendingUp, Globe } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ViewsBarChart } from "@/components/dashboard/views-chart";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";
import { formatNumber } from "@/lib/utils";

export default async function AnalyticsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard/analytics");

  const data = await getDashboardDataCached(session);
  const s = data?.stats;

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Stats for your posts only — not other creators.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Views" value={s?.views30d ?? "0"} delta={s?.viewsDelta ?? 0} icon={<Eye className="h-5 w-5" />} color="from-neon-blue to-neon-cyan" index={0} />
        <StatCard label="Likes" value={s?.reactions ?? "0"} delta={s?.reactionsDelta ?? 0} icon={<Heart className="h-5 w-5" />} color="from-neon-pink to-neon-purple" index={1} />
        <StatCard label="Avg read" value={s?.avgReadTime ?? "—"} delta={0} icon={<Clock className="h-5 w-5" />} color="from-neon-purple to-neon-pink" index={2} />
        <StatCard label="Completion" value={s?.ctr ?? "—"} delta={0} icon={<TrendingUp className="h-5 w-5" />} color="from-neon-orange to-neon-pink" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold">Audience reach (90d)</h2>
              <p className="text-xs text-muted-foreground">
                {s?.publishedCount ?? 0} published posts · {formatNumber(s?.views30dRaw ?? 0)} views (30d) · {formatNumber(s?.totalViews ?? 0)} all-time
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <ViewsBarChart values={s?.viewsDaily ?? []} />
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Your top posts</h2>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
          {(data?.topBlogs ?? []).slice(0, 5).map((b) => (
            <div key={b.id} className="py-2.5 border-b last:border-0 border-border/40">
              <div className="flex justify-between items-center text-sm gap-2">
                <span className="truncate">{b.title}</span>
                <span className="font-semibold text-muted-foreground shrink-0">
                  {formatNumber(b.views)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
