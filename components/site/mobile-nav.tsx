"use client";

import { usePathname } from "next/navigation";
import { Home, Compass, PenSquare, Bell, User } from "lucide-react";
import { LocaleLink } from "@/components/i18n/locale-link";
import { useDictionary } from "@/components/i18n/use-dictionary";
import { stripLocalePrefix } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const MOBILE_TABS = [
  { href: "/", labelKey: "mobile.home", icon: Home },
  { href: "/blogs", labelKey: "mobile.explore", icon: Compass },
  { href: "/dashboard/create", labelKey: "mobile.write", icon: PenSquare, primary: true },
  { href: "/dashboard/notifications", labelKey: "mobile.alerts", icon: Bell },
  { href: "/dashboard", labelKey: "mobile.profile", icon: User },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const path = stripLocalePrefix(pathname || "/");
  const { t } = useDictionary();

  return (
    <div
      id="site-mobile-nav"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <nav className="grid grid-cols-5">
        {MOBILE_TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? path === "/"
              : path === tab.href || path.startsWith(`${tab.href}/`);
          if ("primary" in tab && tab.primary) {
            return (
              <LocaleLink
                key={tab.href}
                href={tab.href}
                className="flex items-center justify-center -mt-6"
                aria-label={t(tab.labelKey)}
              >
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink shadow-neon flex items-center justify-center text-white">
                  <tab.icon className="h-6 w-6" />
                </div>
              </LocaleLink>
            );
          }
          return (
            <LocaleLink
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 gap-1 text-[10px]",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", active && "text-neon-purple")} />
              {t(tab.labelKey)}
            </LocaleLink>
          );
        })}
      </nav>
    </div>
  );
}
