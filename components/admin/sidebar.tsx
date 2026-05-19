"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Inbox,
  FolderTree,
  Users2,
  BarChart3,
  Megaphone,
  Settings,
  Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: Shield, exact: true },
  { href: "/admin/moderation", label: "Moderation Queue", icon: Inbox, badge: 4 },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/users", label: "Users", icon: Users2 },
  { href: "/admin/revenue", label: "Revenue", icon: Megaphone },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/settings", label: "CMS Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-5 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display font-bold leading-none">Admin</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
              ContentVerse Core
            </p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="orange" className="h-5 min-w-5 rounded-full px-1.5 py-0 text-[10px]">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t text-xs text-muted-foreground">
        <p>Logged in as <span className="font-semibold text-foreground">Super Admin</span></p>
      </div>
    </aside>
  );
}
