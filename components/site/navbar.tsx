"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PenSquare, Menu, X, LayoutDashboard } from "lucide-react";
import { Logo } from "./logo";
import { NavDropdown } from "./nav-dropdown";
import { NavWeatherChip } from "./nav-weather-chip";
import { UserNav, MobileUserNav } from "@/components/auth/user-nav";
import { AdminViewButton } from "@/components/auth/admin-view-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { StreakBadge } from "@/components/engagement/streak-badge";
import { Button } from "@/components/ui/button";
import {
  NAV_DROPDOWNS,
  NAV_MOBILE_LINKS,
  NAV_TOP_LINKS,
  isNavActive,
} from "@/lib/site/nav-config";
import { cn } from "@/lib/utils";

export function Navbar({
  embedded = false,
  logoSrc,
  immersive = false,
}: {
  embedded?: boolean;
  logoSrc: string;
  immersive?: boolean;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  const linkClass = (active: boolean) =>
    cn(
      // Match NavDropdown trigger: same py + items-center so News never sits high
      "relative inline-flex h-9 items-center rounded-full px-2 lg:px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0",
      immersive
        ? active
          ? "text-white"
          : "text-white/75 hover:text-white hover:bg-white/10"
        : active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    );

  return (
    <header
      className={cn(
        "overflow-x-clip",
        !embedded && "border-b border-border/50 bg-background/95 backdrop-blur-xl"
      )}
    >
      <div className="container flex h-[3.75rem] items-center gap-2 xl:gap-3 flex-nowrap min-w-0">
        <Logo src={logoSrc} size="sm" immersive={immersive} className="shrink-0" />

        {/* Nav links — fixed width cluster so Jobs never gets crushed */}
        <nav
          className={cn(
            "hidden lg:flex items-center gap-0.5 shrink-0 ml-1 rounded-full border px-0.5 py-0.5",
            immersive
              ? "border-white/10 bg-white/5 backdrop-blur-md"
              : "border-border/50 bg-muted/30 backdrop-blur-sm"
          )}
          aria-label="Main"
        >
          {NAV_DROPDOWNS.map((group) => (
            <NavDropdown key={group.id} group={group} immersive={immersive} />
          ))}
          {NAV_TOP_LINKS.map((link) => {
            const active = isNavActive(pathname, link.href);
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={linkClass(active)}>
                <span className="inline-flex items-center gap-1.5 leading-none">
                  {link.live ? (
                    <span
                      className="relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center"
                      aria-hidden
                    >
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="h-2 w-2 animate-ping rounded-full bg-red-500/45" />
                      </span>
                      <span className="relative h-1.5 w-1.5 rounded-full bg-red-500" />
                    </span>
                  ) : Icon ? (
                    <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  ) : null}
                  <span className={link.live ? "text-red-600 dark:text-red-400" : undefined}>
                    {link.label}
                  </span>
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={cn(
                      "absolute inset-0 -z-10 rounded-full",
                      immersive ? "bg-white/15" : link.live ? "bg-red-500/10" : "bg-primary/10"
                    )}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Breathing room between Jobs and weather */}
        <div className="flex-1 min-w-4" aria-hidden />

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <NavWeatherChip immersive={immersive} className="hidden lg:inline-flex" />
          <Link href="/dashboard/create">
            <Button
              variant="gradient"
              size="sm"
              className="gap-1.5 shrink-0 rounded-full"
            >
              <PenSquare className="h-4 w-4" />
              <span className="hidden xl:inline">Write</span>
            </Button>
          </Link>
          <div className={cn(immersive && "[&_button]:text-white/90 [&_button]:hover:bg-white/10")}>
            <StreakBadge />
          </div>
          <div className={cn(immersive && "[&_button]:text-white/90 [&_button]:hover:bg-white/10")}>
            <NotificationBell />
          </div>
          <div className={cn(immersive && "[&_button]:text-white/90 [&_button]:hover:bg-white/10")}>
            <ThemeToggle />
          </div>
          <UserNav />
        </div>

        <div className="flex items-center gap-1.5 md:hidden shrink-0">
          <NavWeatherChip immersive={immersive} />
          <StreakBadge />
          <div className={cn(immersive && "[&_button]:text-white/90 [&_button]:hover:bg-white/10")}>
            <ThemeToggle />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden shrink-0 rounded-full", immersive && "text-white hover:bg-white/10")}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t bg-background/98 backdrop-blur-2xl"
          >
            <div className="container py-4 space-y-1 max-h-[min(70vh,520px)] overflow-y-auto">
              {NAV_MOBILE_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                      isNavActive(pathname, link.href)
                        ? "bg-neon-purple/10 text-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {link.live ? (
                      <span className="live-news-dot h-2 w-2 rounded-full bg-red-500" aria-hidden />
                    ) : Icon ? (
                      <Icon className="h-4 w-4 text-neon-purple" />
                    ) : null}
                    <span className={link.live ? "font-semibold text-red-600 dark:text-red-400" : undefined}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <AdminViewButton fullWidth variant="gradient" className="w-full mt-2" />
              <div className="flex gap-2 pt-3 sticky bottom-0 bg-background/95 pb-1">
                <MobileUserNav />
                <Link href="/dashboard/create" className="flex-1">
                  <Button variant="gradient" className="w-full rounded-full">
                    Write
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
