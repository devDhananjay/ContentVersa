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
  LayoutDashboard,
} from "lucide-react";
import { Logo } from "./logo";
import { NavDropdown } from "./nav-dropdown";
import { UserNav, MobileUserNav } from "@/components/auth/user-nav";
import { AdminViewButton } from "@/components/auth/admin-view-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { StreakBadge } from "@/components/engagement/streak-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchOpen, setSearchOpen] = React.useState(false);
  const isBlogsPage = pathname === "/blogs" || pathname?.startsWith("/blogs?");

  React.useEffect(() => setMobileOpen(false), [pathname]);

  const linkClass = (active: boolean) =>
    cn(
      "relative rounded-full px-3 py-2 text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0",
      immersive
        ? active
          ? "text-white"
          : "text-white/75 hover:text-white hover:bg-white/10"
        : active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    );

  return (
    <header className={cn(!embedded && "border-b border-border/50 bg-background/95 backdrop-blur-xl")}>
      <div className="container flex h-[3.75rem] items-center gap-2 lg:gap-3 flex-nowrap min-w-0">
        <Logo src={logoSrc} size="sm" immersive={immersive} className="shrink-0" />

        {/* Desktop nav — pill cluster */}
        <nav
          className={cn(
            "hidden lg:flex items-center gap-0.5 shrink-0 ml-2 rounded-full border px-1 py-1",
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
                <span className="inline-flex items-center gap-1.5">
                  {Icon ? <Icon className="h-3.5 w-3.5 opacity-70" /> : null}
                  {link.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={cn(
                      "absolute inset-0 -z-10 rounded-full",
                      immersive ? "bg-white/15" : "bg-neon-purple/10"
                    )}
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
            <div className="hidden xl:flex items-center relative w-36 shrink-0">
              <Search
                className={cn(
                  "absolute left-2.5 h-3.5 w-3.5 pointer-events-none",
                  immersive ? "text-white/50" : "text-muted-foreground"
                )}
              />
              <form action="/blogs" className="w-full">
                <Input
                  name="q"
                  placeholder="Search…"
                  className={cn(
                    "pl-8 h-9 text-sm w-full rounded-full transition-colors",
                    immersive
                      ? "border-white/15 bg-white/10 text-white placeholder:text-white/45 focus-visible:ring-white/25"
                      : "bg-muted/50 border-transparent focus:border-input"
                  )}
                />
              </form>
            </div>
          )}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              "xl:hidden rounded-full",
              immersive && "text-white hover:bg-white/10 hover:text-white"
            )}
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Link href="/dashboard/create">
            <Button
              variant="gradient"
              size="sm"
              className="gap-1.5 shrink-0 rounded-full shadow-lg shadow-neon-purple/20"
            >
              <PenSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Write</span>
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

        <div className="flex items-center gap-1 md:hidden shrink-0">
          <StreakBadge />
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
        {searchOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/40 xl:hidden"
          >
            <div className="container py-3">
              <form action="/blogs" className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="q" placeholder="Search articles…" className="pl-9 rounded-full" />
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <form action="/blogs">
                  <Input name="q" placeholder="Search…" className="pl-9 rounded-full" />
                </form>
              </div>
              {NAV_MOBILE_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                      isNavActive(pathname, link.href)
                        ? "bg-neon-purple/10 text-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {Icon ? <Icon className="h-4 w-4 text-neon-purple" /> : null}
                    {link.label}
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
