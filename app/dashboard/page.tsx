import {
  BarChart3,
  Eye,
  Heart,
  Users,
  Wallet,
  PenSquare,
  Flame,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import { getTrending } from "@/lib/data/blogs";

export default function DashboardOverview() {
  const trending = getTrending(3);
  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, Aarav.</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
            Your <span className="text-gradient">studio</span> overview
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/analytics">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" /> Analytics
            </Button>
          </Link>
          <Link href="/dashboard/create">
            <Button variant="gradient" className="gap-2">
              <PenSquare className="h-4 w-4" /> New blog
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Views (30d)" value="42.8K" delta={28} icon={<Eye className="h-5 w-5" />} color="from-neon-blue to-neon-cyan" index={0} />
        <StatCard label="Reactions" value="3.2K" delta={12} icon={<Heart className="h-5 w-5" />} color="from-neon-pink to-neon-purple" index={1} />
        <StatCard label="Followers" value="1,284" delta={8} icon={<Users className="h-5 w-5" />} color="from-neon-purple to-neon-pink" index={2} />
        <StatCard label="Earnings" value="$1,240" delta={42} icon={<Wallet className="h-5 w-5" />} color="from-neon-orange to-neon-pink" index={3} />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Performance</h2>
            <Badge variant="success">Live</Badge>
          </div>
          <div className="h-64 rounded-xl bg-gradient-to-br from-neon-blue/5 via-neon-purple/5 to-neon-pink/5 border relative overflow-hidden">
            <svg viewBox="0 0 800 250" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,200 C100,180 150,90 250,120 C350,150 400,60 500,80 C600,100 650,30 800,50 L800,250 L0,250 Z"
                fill="url(#g1)"
              />
              <path
                d="M0,200 C100,180 150,90 250,120 C350,150 400,60 500,80 C600,100 650,30 800,50"
                fill="none"
                stroke="#a855f7"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-xs text-muted-foreground">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: "Avg read time", value: "4m 32s" },
              { label: "CTR", value: "8.4%" },
              { label: "Bounce rate", value: "23%" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
                <p className="font-display text-2xl font-extrabold mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-neon-pink">
              <Flame className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">Streak</h3>
            </div>
            <p className="font-display text-5xl font-extrabold mt-2 text-gradient">12 days</p>
            <p className="text-xs text-muted-foreground mt-1">
              Keep writing daily to unlock the Marathon badge (30 days).
            </p>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className={
                  i < 12
                    ? "h-6 rounded bg-gradient-to-br from-neon-orange to-neon-pink"
                    : "h-6 rounded bg-muted"
                }
              />
            ))}
          </div>
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
              Latest milestone
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Top 5% creator this week</p>
                <p className="text-xs text-muted-foreground">Earned 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">Your top performing posts</h2>
          <Link href="/dashboard/blogs">
            <Button variant="outline" size="sm" className="gap-1.5">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {trending.map((b, i) => (
            <BlogCard key={b.id} blog={b} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
