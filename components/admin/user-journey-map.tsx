"use client";

import * as React from "react";
import { MapPin, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PageStep = { path: string; duration: number; visitedAt: string };
type Session = {
  sessionId: string;
  startedAt: string;
  pageCount: number;
  totalDuration: number;
  dropOffPage: string;
  pages: PageStep[];
};

export function UserJourneyMap({ userId }: { userId: string }) {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/admin/users/${userId}/journey`)
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <p className="text-sm text-muted-foreground animate-pulse">Loading journey data…</p>;
  }

  if (!sessions.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No page visit data recorded yet for this user.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total sessions" value={sessions.length} />
        <Stat
          label="Avg pages/session"
          value={Math.round(sessions.reduce((s, x) => s + x.pageCount, 0) / sessions.length)}
        />
        <Stat
          label="Avg duration"
          value={`${Math.round(sessions.reduce((s, x) => s + x.totalDuration, 0) / sessions.length)}s`}
        />
        <Stat
          label="Top drop-off"
          value={getTopDropOff(sessions)}
          isPath
        />
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {sessions.slice(0, 20).map((s) => (
          <SessionCard key={s.sessionId} session={s} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, isPath }: { label: string; value: string | number; isPath?: boolean }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className={`font-display text-lg font-bold mt-0.5 ${isPath ? "truncate text-sm" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function SessionCard({ session }: { session: Session }) {
  const [expanded, setExpanded] = React.useState(false);
  const date = new Date(session.startedAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-xl border bg-card/50 p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium">{date}</span>
          <Badge variant="secondary" className="text-xs">
            {session.pageCount} pages
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(session.totalDuration)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-amber-600 font-medium truncate max-w-[140px]">
            {session.dropOffPage}
          </span>
        </div>
      </button>

      {expanded && (
        <ol className="mt-3 ml-2 border-l-2 border-border pl-4 space-y-1.5">
          {session.pages.map((p, i) => (
            <li key={i} className="text-xs flex items-center gap-2">
              <span className="font-mono text-muted-foreground w-5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="truncate flex-1 font-medium">{p.path}</span>
              <span className="text-muted-foreground shrink-0">{p.duration}s</span>
              {i === session.pages.length - 1 && (
                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getTopDropOff(sessions: Session[]): string {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    const p = s.dropOffPage;
    counts.set(p, (counts.get(p) || 0) + 1);
  }
  let top = "";
  let max = 0;
  for (const [path, count] of counts) {
    if (count > max) {
      max = count;
      top = path;
    }
  }
  return top || "—";
}
