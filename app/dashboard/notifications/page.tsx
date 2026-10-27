import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { NotificationsClient } from "@/components/dashboard/notifications-client";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export default async function NotificationsPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard/notifications");

  const data = await getDashboardDataCached(session);
  const items = data?.notifications ?? [];
  const unread = data?.stats.unreadNotifications ?? 0;

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          {t(dict, "dashboard.notifications")}
          {unread > 0 && (
            <Badge variant="pink" className="rounded-full">
              {unread} new
            </Badge>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">{t(dict, "dashPages.notificationsSub")}</p>
      </div>

      <NotificationsClient
        initialItems={items}
        initialUnread={unread}
        isSuperAdmin={session.role === "SUPER_ADMIN"}
      />
    </div>
  );
}
