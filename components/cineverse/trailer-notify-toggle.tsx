"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function TrailerNotifyToggle({
  tmdbId,
  defaultOn = true,
}: {
  tmdbId: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = React.useState(defaultOn);
  const [loading, setLoading] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState<boolean | null>(null);
  const [onWatchlist, setOnWatchlist] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    fetch(`/api/cineverse/watchlist/notify?tmdbId=${tmdbId}`)
      .then((r) => {
        if (r.status === 401) {
          setLoggedIn(false);
          return null;
        }
        return r.json();
      })
      .then((d: { onWatchlist?: boolean; trailerNotify?: boolean } | null) => {
        if (!d) return;
        setLoggedIn(true);
        setOnWatchlist(!!d.onWatchlist);
        if (typeof d.trailerNotify === "boolean") setOn(d.trailerNotify);
      })
      .catch(() => setLoggedIn(false));
  }, [tmdbId]);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/cineverse/watchlist/notify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, trailerNotify: !on }),
      });
      if (!res.ok) throw new Error("Failed");
      setOn(!on);
      toast.success(!on ? "Trailer alerts on" : "Trailer alerts off");
    } catch {
      toast.error("Could not update alerts");
    } finally {
      setLoading(false);
    }
  }

  if (loggedIn === false) {
    return (
      <Link href={`/auth/sign-in?next=/cineverse/movie/${tmdbId}`}>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Bell className="h-3.5 w-3.5" /> Sign in for trailer alerts
        </Button>
      </Link>
    );
  }

  if (loggedIn === null || onWatchlist === null) return null;

  if (!onWatchlist) {
    return (
      <p className="text-xs text-muted-foreground">
        Add to watchlist to get trailer alerts
      </p>
    );
  }

  return (
    <Button
      variant={on ? "secondary" : "outline"}
      size="sm"
      className="gap-1.5 text-xs"
      onClick={toggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : on ? (
        <Bell className="h-3.5 w-3.5 text-amber-400" />
      ) : (
        <BellOff className="h-3.5 w-3.5" />
      )}
      {on ? "Trailer alerts on" : "Trailer alerts off"}
    </Button>
  );
}
