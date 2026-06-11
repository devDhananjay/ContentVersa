import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/roles";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";
import { getAdminPendingCount } from "@/lib/data/admin-data";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/auth/sign-in?next=/dashboard");
  }

  const data = await getDashboardDataCached(session);
  const adminPendingCount = isAdminRole(session.role)
    ? await getAdminPendingCount()
    : 0;

  return (
    <div className="flex">
      <DashboardSidebar
        unreadNotifications={data?.stats.unreadNotifications ?? 0}
        adminPendingCount={adminPendingCount}
      />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
