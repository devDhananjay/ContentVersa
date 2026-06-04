import Link from "next/link";
import {
  CheckCircle2,
  Heart,
  MessageCircle,
  ThumbsUp,
  UserPlus,
  XCircle,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardNotification } from "@/lib/data/dashboard-data";

const ICON_MAP = {
  approval: CheckCircle2,
  follow: UserPlus,
  like: Heart,
  comment: MessageCircle,
  achievement: ThumbsUp,
  rejection: XCircle,
  system: Bell,
};

const COLOR_MAP = {
  approval: "text-green-500 bg-green-500/10",
  follow: "text-neon-blue bg-neon-blue/10",
  like: "text-neon-pink bg-neon-pink/10",
  comment: "text-neon-purple bg-neon-purple/10",
  achievement: "text-neon-orange bg-neon-orange/10",
  rejection: "text-destructive bg-destructive/10",
  system: "text-muted-foreground bg-muted",
};

export function NotificationsList({ items }: { items: DashboardNotification[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
        No notifications yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((n) => {
        const Icon = ICON_MAP[n.icon] ?? Bell;
        const inner = (
          <div
            className={cn(
              "flex items-start gap-4 p-4 rounded-2xl border bg-card hover:border-neon-purple/40 transition-colors",
              n.unread && "ring-1 ring-neon-purple/30"
            )}
          >
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", COLOR_MAP[n.icon])}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{n.title}</p>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
            </div>
            {n.unread && <div className="h-2 w-2 rounded-full bg-neon-pink shrink-0 mt-2" />}
          </div>
        );

        return n.link ? (
          <Link key={n.id} href={n.link} className="block">
            {inner}
          </Link>
        ) : (
          <div key={n.id}>{inner}</div>
        );
      })}
    </div>
  );
}
