import { BarChart3, Eye, Heart, Clock, TrendingUp, Globe } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AnalyticsPage() {
  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Deep stats across your content, audience and revenue.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Views" value="124.8K" delta={32} icon={<Eye className="h-5 w-5" />} color="from-neon-blue to-neon-cyan" index={0} />
        <StatCard label="Likes" value="8.4K" delta={18} icon={<Heart className="h-5 w-5" />} color="from-neon-pink to-neon-purple" index={1} />
        <StatCard label="Avg read" value="4m 41s" delta={5} icon={<Clock className="h-5 w-5" />} color="from-neon-purple to-neon-pink" index={2} />
        <StatCard label="CTR" value="9.1%" delta={-2} icon={<TrendingUp className="h-5 w-5" />} color="from-neon-orange to-neon-pink" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold">Audience reach (90d)</h2>
              <p className="text-xs text-muted-foreground">Updated 5 min ago</p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-64 grid grid-cols-12 gap-2 items-end px-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const h = 30 + Math.round(Math.abs(Math.sin(i * 0.7)) * 100);
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

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Top countries</h2>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
          {[
            { name: "India", pct: 32 },
            { name: "United States", pct: 24 },
            { name: "United Kingdom", pct: 11 },
            { name: "Germany", pct: 8 },
            { name: "Brazil", pct: 7 },
          ].map((c) => (
            <div key={c.name} className="py-2.5 border-b last:border-0 border-border/40">
              <div className="flex justify-between items-center text-sm">
                <span>{c.name}</span>
                <span className="font-semibold text-muted-foreground">{c.pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"
                  style={{ width: `${c.pct * 2.5}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold mb-4">Top traffic sources</h2>
          {[
            ["X / Twitter", 32],
            ["Google Search", 28],
            ["Direct", 16],
            ["Newsletter", 12],
            ["Reddit", 8],
            ["Other", 4],
          ].map(([name, pct]) => (
            <div key={name as string} className="py-2 border-b last:border-0 border-border/40">
              <div className="flex justify-between text-sm">
                <span>{name}</span>
                <span className="font-semibold text-muted-foreground">{pct}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold mb-4">Audience insights</h2>
          <ul className="text-sm space-y-3">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Age 18–24</span>
              <span className="font-semibold">31%</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Age 25–34</span>
              <span className="font-semibold">42%</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Age 35+</span>
              <span className="font-semibold">27%</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Mobile</span>
              <span className="font-semibold">61%</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Desktop</span>
              <span className="font-semibold">39%</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
