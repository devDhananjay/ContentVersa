import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/roles";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";
import { getAdminPendingCount } from "@/lib/data/admin-data";
import { ReelsStripSection } from "@/components/reels/reels-strip-section";
import { AmbientPageBackground } from "@/components/site/ambient-page-background";

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
      <div className="flex-1 min-w-0">
        <div className="relative overflow-hidden border-b border-border/30">
          <AmbientPageBackground className="h-[280px]" />
          <ReelsStripSection />
        </div>
        {children}
      </div>
    </div>
  );
}
