"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/components/auth/use-session";
import { cn } from "@/lib/utils";

type AppRow = {
  id: string;
  title: string;
  company: string | null;
  url: string | null;
  status: string;
  updatedAt: string;
};

const STATUSES = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
] as const;

export function JobPilotTrackerClient() {
  const { user, loading } = useSession();
  const [apps, setApps] = React.useState<AppRow[]>([]);
  const [stats, setStats] = React.useState({
    total: 0,
    interviews: 0,
    offers: 0,
    responseRate: 0,
  });
  const [busy, setBusy] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!user) return;
    setBusy(true);
    try {
      const res = await fetch("/api/jobpilot/tracker", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setApps(data.applications || []);
      setStats(data.stats || stats);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setBusy(false);
    }
  }, [user]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/jobpilot/tracker", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  if (loading || (user && busy && apps.length === 0)) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/auth/sign-in?next=/jobpilot/tracker" className="underline text-emerald-600">
          Sign in
        </Link>{" "}
        to view your tracker.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Applications", value: stats.total },
          { label: "Interviews", value: stats.interviews },
          { label: "Offers", value: stats.offers },
          { label: "Response Rate", value: `${stats.responseRate}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {s.label}
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No jobs saved yet. Analyze a LinkedIn/Naukri job in the extension and tap
          Save to Tracker.
        </div>
      ) : (
        <ul className="space-y-2">
          {apps.map((app) => (
            <li
              key={app.id}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{app.title}</p>
                <p className="text-xs text-muted-foreground">
                  {app.company || "—"}
                  {app.url ? (
                    <>
                      {" · "}
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        Open
                      </a>
                    </>
                  ) : null}
                </p>
              </div>
              <Select
                value={app.status}
                onValueChange={(v) => void updateStatus(app.id, v)}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </li>
          ))}
        </ul>
      )}

      <Button asChild variant="outline" size="sm">
        <Link href="/jobpilot">Back to JobPilot</Link>
      </Button>
    </div>
  );
}
