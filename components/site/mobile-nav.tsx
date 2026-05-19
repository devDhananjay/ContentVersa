"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PenSquare, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blogs", label: "Explore", icon: Compass },
  { href: "/dashboard/create", label: "Write", icon: PenSquare, primary: true },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell },
  { href: "/dashboard", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <nav className="grid grid-cols-5">
        {MOBILE_TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(tab.href);
          if (tab.primary) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center justify-center -mt-6"
              >
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink shadow-neon flex items-center justify-center text-white">
                  <tab.icon className="h-6 w-6" />
                </div>
              </Link>
            );
          }
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 gap-1 text-[10px]",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", active && "text-neon-purple")} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
