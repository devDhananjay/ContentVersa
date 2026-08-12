"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * One-tap subscribe / unsubscribe for cricket match reminders
 * (30 minutes before upcoming matches).
 */
export function CricketAlertSubscribe() {
  const router = useRouter();
  const [subscribed, setSubscribed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [signedIn, setSignedIn] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/sports/cricket-alerts/subscribe", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { subscribed?: boolean; signedIn?: boolean }) => {
        if (typeof data.subscribed === "boolean") setSubscribed(data.subscribed);
        if (data.signedIn === false) setSignedIn(false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = async () => {
    if (!signedIn) {
      router.push("/auth/sign-in?next=/sports");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/sports/cricket-alerts/subscribe", {
        method: subscribed ? "DELETE" : "POST",
        credentials: "include",
      });
      if (res.status === 401) {
        router.push("/auth/sign-in?next=/sports");
        return;
      }
      if (!res.ok) {
        toast.error("Could not update subscription. Try again.");
        return;
      }
      const data = (await res.json()) as { subscribed?: boolean };
      const next =
        typeof data.subscribed === "boolean" ? data.subscribed : !subscribed;
      setSubscribed(next);
      toast.success(
        next
          ? "Subscribed — you'll get alerts 30 min before matches."
          : "Unsubscribed — no more cricket match alerts."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="flex flex-col gap-3 rounded-2xl border border-neon-cyan/25 bg-neon-cyan/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-neon-cyan/15 p-2">
            <Bell className="h-4 w-4 text-neon-cyan" />
          </div>
          <div>
            <p className="text-sm font-semibold">Cricket match alerts</p>
            <p className="text-xs text-muted-foreground">
              Want a notification 30 minutes before upcoming matches? Subscribe
              so you never miss the toss or the first ball.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant={subscribed ? "outline" : "default"}
          className="shrink-0 gap-2"
          disabled={loading || busy}
          onClick={() => void toggle()}
        >
          {busy || loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : subscribed ? (
            <>
              <BellOff className="h-4 w-4" />
              Unsubscribe
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" />
              Subscribe
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
