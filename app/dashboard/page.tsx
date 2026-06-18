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
import { ViewsAreaChart } from "@/components/dashboard/views-chart";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";
import { requireUserId } from "@/lib/auth/resolve-user-id";
import { getUserReels, getUserReelStats } from "@/lib/reels/data";
import { ReelsDashboardPanel } from "@/components/reels/reels-dashboard-panel";
import { getUserStreakState } from "@/lib/engagement/streak";
import {
  STREAK_MIN_PROGRESS,
  STREAK_MIN_SECONDS,
} from "@/lib/engagement/streak";
import { StreakShareCard } from "@/components/engagement/streak-share-card";
import { ReadingChallengeCard } from "@/components/engagement/reading-challenge-card";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default async function DashboardOverview() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard");

  const [data, authorId] = await Promise.all([
    getDashboardDataCached(session),
    requireUserId(session).catch(() => null),
  ]);
  const streakState = authorId ? await getUserStreakState(authorId) : null;
  const [reels, reelStats] = authorId
    ? await Promise.all([getUserReels(authorId), getUserReelStats(authorId)])
    : [[], { totalViews: 0, totalReels: 0, publishedReels: 0, views30d: 0 }];
  const firstName = (session.name || session.username || "there").split(" ")[0];
  const stats = data?.stats;
  const topBlogs = data?.topBlogs ?? [];
  const streak = streakState?.streakDays ?? stats?.streakDays ?? 0;
  const longest = streakState?.longestStreak ?? streak;
  const calendar = streakState?.calendar ?? [];
  const todayDone = streakState?.todayQualified ?? false;

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, {firstName}.</p>
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
        <StatCard label="Views (30d)" value={stats?.views30d ?? "0"} delta={stats?.viewsDelta ?? 0} icon={<Eye className="h-5 w-5" />} color="from-neon-blue to-neon-cyan" index={0} />
        <StatCard label="Reactions" value={stats?.reactions ?? "0"} delta={stats?.reactionsDelta ?? 0} icon={<Heart className="h-5 w-5" />} color="from-neon-pink to-neon-purple" index={1} />
        <StatCard label="Followers" value={stats?.followers ?? "0"} delta={stats?.followersDelta ?? 0} icon={<Users className="h-5 w-5" />} color="from-neon-purple to-neon-pink" index={2} />
        <StatCard label="Earnings (month)" value={stats?.earnings ?? formatINR(0)} delta={stats?.earningsDelta ?? 0} icon={<Wallet className="h-5 w-5" />} color="from-neon-orange to-neon-pink" index={3} />
      </div>

      <div className="mt-8">
        <ReelsDashboardPanel reels={reels} stats={reelStats} />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Performance</h2>
            <Badge variant="secondary">Last 30 days</Badge>
          </div>
          <ViewsAreaChart values={stats?.viewsDaily ?? []} />
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: "Avg read time", value: stats?.avgReadTime ?? "—" },
              { label: "CTR", value: stats?.ctr ?? "—" },
              { label: "Bounce rate", value: stats?.bounceRate ?? "—" },
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
            <p className="font-display text-5xl font-extrabold mt-2 text-gradient">{streak} days</p>
            <p className="text-xs text-muted-foreground mt-1">
              {todayDone
                ? "Today's reading goal complete — come back tomorrow!"
                : `Read ${STREAK_MIN_SECONDS}s or scroll ${STREAK_MIN_PROGRESS}% of any article today.`}
            </p>
            {longest > streak && (
              <p className="text-xs text-muted-foreground">Best streak: {longest} days</p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
              Last 7 days
            </p>
            <div className="grid grid-cols-7 gap-1.5">
              {calendar.map((active, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={
                      active
                        ? "h-8 w-full rounded-md bg-gradient-to-br from-neon-orange to-neon-pink"
                        : "h-8 w-full rounded-md bg-muted"
                    }
                  />
                  <span className="text-[10px] text-muted-foreground">{DAY_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </div>
          <Link href="/blogs">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Flame className="h-4 w-4" />
              {todayDone ? "Read more articles" : "Start reading"}
            </Button>
          </Link>
          <StreakShareCard streakDays={streak} className="mt-4" />
          <div className="pt-4 border-t">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {streak >= 30
                    ? "Marathon Reader"
                    : streak >= 7
                      ? "Week Warrior"
                      : data?.achievements[0]?.title ?? "Start your streak"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {streak >= 30
                    ? "30-day reading streak unlocked"
                    : streak >= 7
                      ? "7-day reading streak unlocked"
                      : `${7 - Math.min(streak, 7)} days to Week Warrior badge`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ReadingChallengeCard />
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
        {topBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topBlogs.map((b, i) => (
              <BlogCard key={b.id} blog={b} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            <p>No posts yet.</p>
            <Link href="/dashboard/create" className="mt-4 inline-block">
              <Button variant="gradient">Create your first blog</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
