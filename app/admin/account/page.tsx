import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, Settings, Inbox, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth/roles";
import { getAdminPendingCount } from "@/lib/data/admin-data";

export default async function AdminAccountPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/admin/account");
  if (!isAdminRole(session.role)) redirect("/dashboard");

  const pendingCount = await getAdminPendingCount();

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-3">
        <Shield className="h-8 w-8 text-orange-500" />
        Admin account
      </h1>
      <p className="text-muted-foreground mt-2">
        Your platform administrator profile and shortcuts.
      </p>

      <div className="mt-8 rounded-2xl border bg-card p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Name</p>
          <p className="font-semibold text-lg">{session.name || session.username}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Email</p>
          <p className="font-medium">{session.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Role</p>
          <Badge variant="orange" className="mt-1 capitalize">
            {session.role?.toLowerCase().replace(/_/g, " ")}
          </Badge>
        </div>
        {pendingCount > 0 && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-2">
              {pendingCount} blog{pendingCount === 1 ? "" : "s"} waiting for your review.
            </p>
            <Link href="/admin/moderation">
              <Button variant="gradient" className="gap-2">
                <Inbox className="h-4 w-4" />
                Open moderation queue
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/admin/settings">
          <Button variant="outline" className="w-full gap-2 justify-start">
            <Settings className="h-4 w-4" />
            Admin settings
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="w-full gap-2 justify-start">
            <LayoutDashboard className="h-4 w-4" />
            Creator dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
