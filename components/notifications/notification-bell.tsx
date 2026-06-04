"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/components/auth/use-session";

export function NotificationBell() {
  const { user } = useSession();
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/notifications", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as { unread?: number };
        if (!cancelled) setUnread(data.unread ?? 0);
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user]);

  if (!user) return null;

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/dashboard/notifications" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <Badge
            variant="pink"
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full px-1 py-0 text-[10px] pointer-events-none"
          >
            {unread > 9 ? "9+" : unread}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
