import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminViewBanner } from "@/components/admin/admin-view-banner";
import { getCurrentUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/roles";
import { getAdminPendingCount, getAdminPendingReelCount } from "@/lib/data/admin-data";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/auth/sign-in?next=/admin");
  }
  if (!isAdminRole(session.role)) {
    redirect("/dashboard?error=admin_required");
  }

  const [pendingCount, pendingReelCount] = await Promise.all([
    getAdminPendingCount(),
    getAdminPendingReelCount(),
  ]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <AdminViewBanner pendingCount={pendingCount} pendingReelCount={pendingReelCount} />
      <div className="flex flex-1">
        <AdminSidebar pendingCount={pendingCount} pendingReelCount={pendingReelCount} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
