"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Inbox,
  FileText,
  Film,
  FolderTree,
  Users2,
  BarChart3,
  Megaphone,
  Settings,
  Flag,
  UserCog,
  Sparkles,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreatorDashboardLink } from "@/components/admin/creator-dashboard-link";
import { useSession } from "@/components/auth/use-session";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Shield;
  exact?: boolean;
  badge?: number;
};

export function AdminSidebar({
  pendingCount = 0,
  pendingReelCount = 0,
}: {
  pendingCount?: number;
  pendingReelCount?: number;
}) {
  const pathname = usePathname();
  const { user } = useSession();
  const displayName = user?.name || user?.username || "Admin";

  const NAV: NavItem[] = [
    { href: "/admin", label: "Admin home", icon: Shield, exact: true },
    {
      href: "/admin/moderation",
      label: "Approve blogs",
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      href: "/admin/reels-moderation",
      label: "Approve reels",
      icon: Film,
      badge: pendingReelCount > 0 ? pendingReelCount : undefined,
    },
    { href: "/admin/blogs", label: "All blogs", icon: FileText },
    { href: "/admin/ai-articles", label: "AI articles", icon: Sparkles },
    { href: "/admin/meta-publishing", label: "Meta publishing", icon: Share2 },
    { href: "/admin/users", label: "All users", icon: Users2 },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/revenue", label: "Revenue", icon: Megaphone },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/reports", label: "Reports", icon: Flag },
    { href: "/admin/settings", label: "Admin settings", icon: Settings },
    { href: "/admin/account", label: "Admin account", icon: UserCog },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-orange-500/20 bg-card/40 backdrop-blur min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-5 border-b border-orange-500/20">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center text-white shadow-lg">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display font-bold leading-none">Admin View</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
              Moderation & platform
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <CreatorDashboardLink className="mb-2 border border-dashed border-border/60" />
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="orange" className="h-5 min-w-5 rounded-full px-1.5 py-0 text-[10px]">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-orange-500/20 text-xs text-muted-foreground">
        <p>
          Signed in as{" "}
          <span className="font-semibold text-foreground">{displayName}</span>
        </p>
        <p className="mt-0.5 capitalize">{user?.role?.toLowerCase().replace(/_/g, " ")}</p>
      </div>
    </aside>
  );
}
