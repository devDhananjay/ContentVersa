"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PenSquare,
  Bell,
  Menu,
  X,
  Compass,
  Trophy,
  Bookmark,
  LayoutDashboard,
} from "lucide-react";
import { Logo } from "./logo";
import { UserNav, MobileUserNav } from "@/components/auth/user-nav";
import { AdminViewButton } from "@/components/auth/admin-view-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/blogs", label: "Explore", icon: Compass },
  { href: "/categories", label: "Categories", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center gap-4">
        <Logo />

        <nav className="hidden lg:flex items-center gap-1 ml-6">
          {NAV_LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 rounded-lg text-sm font-medium transition-colors",
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

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-2 max-w-sm w-full relative">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <form action="/blogs" className="w-full">
            <Input
              name="q"
              placeholder="Search articles, creators, tags…"
              className="pl-9 bg-muted/50 border-transparent focus:border-input"
            />
          </form>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/dashboard/create">
            <Button variant="gradient" size="sm" className="gap-1.5">
              <PenSquare className="h-4 w-4" />
              Write
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="pink"
              className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full px-1 py-0 text-[10px]"
            >
              3
            </Badge>
          </Button>
          <ThemeToggle />
          <AdminViewButton variant="outline" />
          <UserNav />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
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
                <Input placeholder="Search…" className="pl-9" />
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
                  <Button variant="gradient" className="w-full">Write</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
