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
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/blogs", label: "My Blogs", icon: FileText },
  { href: "/dashboard/create", label: "Create", icon: PenSquare, primary: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/earnings", label: "Earnings", icon: Wallet },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badge: 3 },
  { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-5 border-b">
        <Logo />
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
      <div className="p-3 border-t">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>YOU</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">Aarav Mehta</p>
            <p className="text-xs text-muted-foreground truncate">aarav@contentverse.app</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
