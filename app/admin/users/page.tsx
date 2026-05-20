import Link from "next/link";
import { redirect } from "next/navigation";
import { Users2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { getAdminUsers } from "@/lib/data/admin-data";
import { getCurrentUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/roles";

export default async function AdminUsersPage() {
  const session = await getCurrentUser();
  if (!session || !isAdminRole(session.role)) {
    redirect("/dashboard?error=admin_required");
  }

  const users = await getAdminUsers();
  const isSuperAdmin = session.role === "SUPER_ADMIN";

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Admin home
          </Button>
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <Users2 className="h-8 w-8 text-neon-blue" />
          Users ({users.length})
        </h1>
        <p className="text-muted-foreground mt-1">
          {isSuperAdmin
            ? "Add users or Super Admins, and change roles from the table."
            : "View all registered users on the platform."}
        </p>
      </div>

      <AdminUsersTable users={users} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
