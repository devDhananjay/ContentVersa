import { Users2, FileText, Eye, Globe } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminAnalyticsPage() {
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
        <StatCard label="DAU" value="38.1K" delta={6} icon={<Users2 className="h-5 w-5" />} color="from-neon-blue to-neon-cyan" index={0} />
        <StatCard label="Articles" value="124K" delta={14} icon={<FileText className="h-5 w-5" />} color="from-neon-purple to-neon-pink" index={1} />
        <StatCard label="Page views" value="9.4M" delta={22} icon={<Eye className="h-5 w-5" />} color="from-neon-orange to-neon-pink" index={2} />
        <StatCard label="Countries" value="142" delta={2} icon={<Globe className="h-5 w-5" />} color="from-emerald-500 to-teal-500" index={3} />
      </div>
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-display text-xl font-bold mb-6">Traffic by week</h2>
        <div className="h-72 grid grid-cols-12 gap-2 items-end px-2">
          {Array.from({ length: 12 }).map((_, i) => {
            const h = 20 + Math.round(Math.abs(Math.cos(i * 0.6)) * 100);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-neon-blue via-neon-purple to-neon-pink"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
