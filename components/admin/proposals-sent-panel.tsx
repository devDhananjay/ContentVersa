"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatAdminDate } from "@/lib/admin/list-filters";
import { getInitials } from "@/lib/utils";
import type { ProposalSendRow } from "@/lib/notifications/send-proposal";

export function ProposalsSentPanel({ active }: { active?: boolean }) {
  const [rows, setRows] = React.useState<ProposalSendRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/send-proposal?limit=100", {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRows(Array.isArray(data.data) ? data.data : []);
      setLoaded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (active && !loaded && !loading) void load();
  }, [active, loaded, loading, load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Sponsored proposal emails already sent to authors.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={loading}
          onClick={() => void load()}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {loading && !loaded ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading proposals…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          No proposals sent yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage
                  src={r.recipient.image || undefined}
                  alt={r.recipient.name || r.recipient.username}
                />
                <AvatarFallback>
                  {getInitials(r.recipient.name || r.recipient.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold truncate">
                    {r.recipientName || r.recipient.name || r.recipient.username}
                  </p>
                  <Badge variant="secondary" className="gap-1 font-normal">
                    <Mail className="h-3 w-3" /> {r.toEmail}
                  </Badge>
                  <Badge variant="outline">{r.blog.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  Blog:{" "}
                  <Link
                    href={`/admin/blogs/${r.blog.id}`}
                    className="text-foreground hover:underline"
                  >
                    {r.blogTitle || r.blog.title}
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">
                  Sent {formatAdminDate(r.createdAt)} · by{" "}
                  {r.sentBy.name || r.sentBy.username} · from {r.fromEmail}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/blogs/${r.blog.id}`}>Open blog</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
