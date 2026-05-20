import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";

export default async function NotificationsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard/notifications");

  const data = await getDashboardDataCached(session);
  const items = data?.notifications ?? [];
  const unread = data?.stats.unreadNotifications ?? 0;

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            Notifications
            {unread > 0 && (
              <Badge variant="pink" className="rounded-full">
                {unread} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Activity on your posts and account only.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled>
          Mark all read
        </Button>
      </div>

      <NotificationsList items={items} />
    </div>
  );
}
