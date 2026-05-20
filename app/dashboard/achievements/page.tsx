import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";

export default async function AchievementsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard/achievements");

  const data = await getDashboardDataCached(session);
  const earned = data?.achievements ?? [];

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <Trophy className="h-8 w-8 text-neon-orange" />
          Achievements
        </h1>
        <p className="text-muted-foreground mt-1">
          Badges earned on your creator journey.
        </p>
      </div>

      {earned.length > 0 ? (
        <div className="grid gap-4">
          {earned.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-4 p-5 rounded-2xl border bg-card border-neon-purple/20"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-white shrink-0">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display text-lg font-bold">{a.title}</h2>
                  <Badge variant="success">Earned</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(a.earnedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          <p>No achievements yet. Publish and engage to unlock badges.</p>
        </div>
      )}
    </div>
  );
}
