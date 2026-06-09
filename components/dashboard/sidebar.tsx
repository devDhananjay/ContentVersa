"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  BarChart3,
  Bell,
  Wallet,
  Settings,
  Trophy,
  Bookmark,
  LogOut,
  Shield,
  Film,
} from "lucide-react";
import { isAdminRole } from "@/lib/auth/roles";
import { useSignOut } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/site/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/components/auth/use-session";
import { cn, getInitials } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  primary?: boolean;
  badge?: number;
}

interface SidebarProps {
  unreadNotifications?: number;
  adminPendingCount?: number;
}

export function DashboardSidebar({
  unreadNotifications = 0,
  adminPendingCount = 0,
}: SidebarProps) {
  const NAV: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/blogs", label: "My Blogs", icon: FileText },
    { href: "/dashboard/reels", label: "My Reels", icon: Film },
    { href: "/dashboard/create", label: "Create", icon: PenSquare, primary: true },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/earnings", label: "Earnings", icon: Wallet },
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
    { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Bookmark },
    { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];
  const pathname = usePathname();
  const { user } = useSession();
  const { signOut, loading: signingOut } = useSignOut();
  const displayName = user?.name || user?.username || "Account";
  const displayEmail = user?.email || "";
  const displayImage = user?.image;

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-5 border-b">
        <Logo />
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {isAdminRole(user?.role) && (
          <Link
            href="/admin"
            className="mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:brightness-110 transition-all"
          >
            <Shield className="h-4 w-4" />
            <span className="flex-1">Admin View</span>
            {adminPendingCount > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 rounded-full px-1.5 py-0 text-[10px] bg-white/20">
                {adminPendingCount}
              </Badge>
            )}
          </Link>
        )}
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
                item.primary && "bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-white shadow-neon hover:brightness-110",
                !item.primary && active && "bg-accent/10 text-accent",
                !item.primary && !active && "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="pink" className="h-5 min-w-5 rounded-full px-1.5 py-0 text-[10px]">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors"
        >
          <Avatar className="h-9 w-9">
            {displayImage ? (
              <AvatarImage src={displayImage} alt={displayName} />
            ) : null}
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => signOut()}
          disabled={signingOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
