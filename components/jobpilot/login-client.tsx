"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Copy, Loader2, Target } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/auth/use-session";

export function JobPilotLoginClient() {
  const searchParams = useSearchParams();
  const fromExt = searchParams.get("ext") === "1" || searchParams.get("from") === "extension";
  const { user, loading: sessionLoading } = useSession();
  const [token, setToken] = React.useState<string | null>(searchParams.get("token"));
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!user || token || sessionLoading) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const res = await fetch("/api/jobpilot/auth/exchange", {
          method: "POST",
          credentials: "include",
        });
        const data = (await res.json()) as { token?: string; error?: string };
        if (!res.ok) throw new Error(data.error || "Exchange failed");
        if (!cancelled && data.token) {
          setToken(data.token);
          if (fromExt) {
            const url = new URL(window.location.href);
            url.searchParams.set("ext", "1");
            url.searchParams.set("token", data.token);
            window.history.replaceState({}, "", url.toString());
          }
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not connect");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, token, sessionLoading, fromExt]);

  const copyToken = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    toast.success("Token copied — paste into the extension if needed");
  };

  if (sessionLoading) {
    return (
      <div className="flex justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!user) {
    const next = `/jobpilot/login${fromExt ? "?ext=1" : ""}`;
    return (
      <div className="rounded-2xl border bg-card p-8 space-y-4 text-center">
        <Target className="h-10 w-10 text-emerald-500 mx-auto" />
        <h1 className="font-display text-2xl font-bold">ContentVerse HirePilot</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to ContentVerse to connect the HirePilot Chrome extension and sync your
          resume, analyses, and job tracker.
        </p>
        <Button asChild variant="gradient">
          <Link href={`/auth/sign-in?next=${encodeURIComponent(next)}`}>
            Sign in to continue
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-8 space-y-5">
      <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-emerald-500" />
        <div>
          <h1 className="font-display text-2xl font-bold">ContentVerse HirePilot</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {user.email}
          </p>
        </div>
      </div>

      {busy && !token ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Connecting extension…
        </div>
      ) : null}

      {token ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Extension token ready
          </p>
          <p className="text-xs text-muted-foreground">
            {fromExt
              ? "Return to the JobPilot extension — it will pick up this token automatically. Or copy it below."
              : "Copy this token into the JobPilot Chrome extension settings if prompted."}
          </p>
          <div className="flex gap-2">
            <code className="flex-1 text-[10px] break-all rounded-lg bg-muted/50 p-2 max-h-20 overflow-y-auto">
              {token.slice(0, 48)}…
            </code>
            <Button size="sm" variant="outline" onClick={() => void copyToken()}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/jobpilot/tracker">Open Job Tracker</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/jobpilot">Resume & overview</Link>
        </Button>
      </div>
    </div>
  );
}
