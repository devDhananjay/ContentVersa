"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PenSquare, Menu, X, LayoutDashboard } from "lucide-react";
import { Logo } from "./logo";
import { NavDropdown } from "./nav-dropdown";
import { NavWeatherChip } from "./nav-weather-chip";
import { NavLocaleToggle } from "./nav-locale-toggle";
import { UserNav, MobileUserNav } from "@/components/auth/user-nav";
import { AdminViewButton } from "@/components/auth/admin-view-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { StreakBadge } from "@/components/engagement/streak-badge";
import { Button } from "@/components/ui/button";
import { LocaleLink } from "@/components/i18n/locale-link";
import { useDictionary } from "@/components/i18n/use-dictionary";
import {
  NAV_DROPDOWNS,
  NAV_MOBILE_LINKS,
  NAV_TOP_LINKS,
  isNavActive,
} from "@/lib/site/nav-config";
import { NAV_ITEM_I18N, NAV_TOP_I18N } from "@/lib/i18n/nav-labels";
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
  const { t } = useDictionary();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  const linkClass = (active: boolean) =>
    cn(
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
        !embedded && "border-b border-border/50 bg-background/95 backdrop-blur-xl"
      )}
    >
      <div className="container flex h-[3.75rem] min-w-0 items-center gap-1.5 xl:gap-2.5">
        <Logo src={logoSrc} size="sm" immersive={immersive} className="shrink-0" />

        <nav
          className={cn(
            "ml-0.5 hidden min-w-0 shrink items-center gap-0.5 overflow-x-auto rounded-full border px-0.5 py-0.5 lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
            const label = NAV_TOP_I18N[link.href]
              ? t(NAV_TOP_I18N[link.href], link.label)
              : link.label;
            return (
              <LocaleLink key={link.href} href={link.href} className={linkClass(active)}>
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
                  <span
                    className={link.live ? "text-red-600 dark:text-red-400" : undefined}
                  >
                    {label}
                  </span>
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={cn(
                      "absolute inset-0 -z-10 rounded-full",
                      immersive
                        ? "bg-white/15"
                        : link.live
                          ? "bg-red-500/10"
                          : "bg-primary/10"
                    )}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </LocaleLink>
            );
          })}
        </nav>

        <div className="min-w-2 flex-1" aria-hidden />

        {/* Desktop / tablet actions — compact, never clip the profile circle */}
        <div className="hidden shrink-0 items-center gap-1 md:flex md:gap-1.5">
          <NavWeatherChip
            immersive={immersive}
            className="hidden max-w-[7.5rem] lg:inline-flex"
          />

          <LocaleLink href="/dashboard/create" className="shrink-0">
            <Button
              size="sm"
              className="h-9 gap-1.5 rounded-full px-2.5 xl:px-3.5 bg-black text-white hover:bg-neutral-900 hover:text-white"
            >
              <PenSquare className="h-4 w-4" />
              <span className="hidden xl:inline">{t("nav.write")}</span>
            </Button>
          </LocaleLink>

          <div
            className={cn(
              "flex items-center gap-0.5",
              immersive && "[&_button]:text-white/90 [&_button]:hover:bg-white/10 [&_a]:text-white/90"
            )}
          >
            <StreakBadge />
            <NotificationBell />
          </div>

          <span
            aria-hidden
            className={cn(
              "mx-0.5 hidden h-5 w-px shrink-0 sm:block",
              immersive ? "bg-white/20" : "bg-border/70"
            )}
          />

          <NavLocaleToggle immersive={immersive} />
          <div
            className={cn(
              immersive && "[&_button]:text-white/90 [&_button]:hover:bg-white/10"
            )}
          >
            <ThemeToggle />
          </div>

          <UserNav immersive={immersive} />

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 shrink-0 rounded-full lg:hidden",
              immersive && "text-white hover:bg-white/10"
            )}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t("nav.toggleMenu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Phone */}
        <div className="ml-auto flex shrink-0 items-center gap-1 md:hidden">
          <NavLocaleToggle immersive={immersive} />
          <div
            className={cn(
              immersive && "[&_button]:text-white/90 [&_button]:hover:bg-white/10"
            )}
          >
            <ThemeToggle />
          </div>
          <UserNav immersive={immersive} />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 shrink-0 rounded-full",
              immersive && "text-white hover:bg-white/10"
            )}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t("nav.toggleMenu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="border-t bg-background/98 backdrop-blur-2xl lg:hidden"
          >
            <div className="container max-h-[min(70vh,520px)] space-y-1 overflow-y-auto py-4">
              {NAV_MOBILE_LINKS.map((link) => {
                const Icon = link.icon;
                const keys = NAV_ITEM_I18N[link.href] ?? {
                  label: NAV_TOP_I18N[link.href],
                };
                const label = keys?.label
                  ? t(keys.label, link.label)
                  : link.label;
                return (
                  <LocaleLink
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
                      <span
                        className="live-news-dot h-2 w-2 rounded-full bg-red-500"
                        aria-hidden
                      />
                    ) : Icon ? (
                      <Icon className="h-4 w-4 text-neon-purple" />
                    ) : null}
                    <span
                      className={
                        link.live
                          ? "font-semibold text-red-600 dark:text-red-400"
                          : undefined
                      }
                    >
                      {label}
                    </span>
                  </LocaleLink>
                );
              })}
              <LocaleLink
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t("nav.dashboard")}
              </LocaleLink>
              <AdminViewButton fullWidth variant="gradient" className="mt-2 w-full" />
              <div className="sticky bottom-0 flex gap-2 bg-background/95 pb-1 pt-3">
                <MobileUserNav />
                <LocaleLink href="/dashboard/create" className="flex-1">
                  <Button className="w-full rounded-full bg-black text-white hover:bg-neutral-900 hover:text-white">
                    {t("nav.write")}
                  </Button>
                </LocaleLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
