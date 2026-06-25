import { Users2, FileText, Eye, Globe } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrafficChart } from "@/components/admin/traffic-chart";
import { getPlatformAnalytics } from "@/lib/data/admin-platform-stats";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const stats = await getPlatformAnalytics();

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          Platform analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Growth, traffic and content performance at the platform level.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="DAU"
          value={formatNumber(stats.dau)}
          delta={stats.dauDelta}
          icon={<Users2 className="h-5 w-5" />}
          color="from-neon-blue to-neon-cyan"
          index={0}
        />
        <StatCard
          label="Articles"
          value={formatNumber(stats.articles)}
          delta={stats.articlesDelta}
          icon={<FileText className="h-5 w-5" />}
          color="from-neon-purple to-neon-pink"
          index={1}
        />
        <StatCard
          label="Page views"
          value={formatNumber(stats.pageViews)}
          delta={stats.pageViewsDelta}
          icon={<Eye className="h-5 w-5" />}
          color="from-neon-orange to-neon-pink"
          index={2}
        />
        <StatCard
          label="Locations"
          value={formatNumber(stats.countries)}
          delta={stats.countriesDelta}
          icon={<Globe className="h-5 w-5" />}
          color="from-emerald-500 to-teal-500"
          index={3}
        />
      </div>
      <TrafficChart weeks={stats.weeklyTraffic} />
    </div>
  );
}
