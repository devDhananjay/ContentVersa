"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PenSquare,
  Menu,
  X,
  Compass,
  Bookmark,
  LayoutDashboard,
  Medal,
  TrendingUp,
  Film,
  Briefcase,
  Map,
  Clapperboard,
  Wallet,
  Gem,
} from "lucide-react";
import { Logo } from "./logo";
import { UserNav, MobileUserNav } from "@/components/auth/user-nav";
import { AdminViewButton } from "@/components/auth/admin-view-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { StreakBadge } from "@/components/engagement/streak-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/blogs", label: "Explore", icon: Compass },
  { href: "/sports", label: "Sports", icon: Medal },
  { href: "/finance", label: "Finance", icon: TrendingUp },
  { href: "/cineverse", label: "CineVerse", icon: Clapperboard },
  { href: "/goldverse", label: "GoldVerse", icon: Gem },
  { href: "/moneyverse", label: "MoneyVerse", icon: Wallet },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/reels", label: "Reels", icon: Film },
  { href: "/categories", label: "Categories", icon: LayoutDashboard },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/site-map", label: "Site Map", icon: Map },
];

export function Navbar({
  embedded = false,
  logoSrc,
}: {
  embedded?: boolean;
  logoSrc: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isBlogsPage = pathname === "/blogs" || pathname?.startsWith("/blogs?");

  React.useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className={cn(!embedded && "fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50")}>
      <div className="container flex h-14 items-center gap-1.5 lg:gap-2 flex-nowrap min-w-0">
        <Logo src={logoSrc} size="sm" className="shrink-0" />

        <nav
          className="hidden lg:flex items-center gap-0 shrink-0"
          aria-label="Main"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-2 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 -z-10 rounded-lg bg-accent/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 min-w-2" />

        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {!isBlogsPage && (
            <div className="hidden lg:flex items-center relative w-32 xl:w-36 shrink-0">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <form action="/blogs" className="w-full">
                <Input
                  name="q"
                  placeholder="Search…"
                  className="pl-8 h-9 text-sm bg-muted/50 border-transparent focus:border-input w-full"
                />
              </form>
            </div>
          )}
          <Link href="/dashboard/create">
            <Button variant="gradient" size="sm" className="gap-1.5 shrink-0">
              <PenSquare className="h-4 w-4" />
              Write
            </Button>
          </Link>
          <StreakBadge />
          <NotificationBell />
          <ThemeToggle />
          <UserNav />
        </div>

        <div className="flex items-center gap-1 md:hidden shrink-0">
          <StreakBadge />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
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
            className="md:hidden border-t bg-background/95 backdrop-blur-xl"
          >
            <div className="container py-4 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <form action="/blogs">
                  <Input name="q" placeholder="Search…" className="pl-9" />
                </form>
              </div>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-muted"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <AdminViewButton fullWidth variant="gradient" className="w-full" />
              <div className="flex gap-2 pt-2">
                <MobileUserNav />
                <Link href="/dashboard/create" className="flex-1">
                  <Button variant="gradient" className="w-full">
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
