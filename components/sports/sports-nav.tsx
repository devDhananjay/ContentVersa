"use client";

import { usePathname } from "next/navigation";
import { LocaleLink } from "@/components/i18n/locale-link";
import { useDictionary } from "@/components/i18n/use-dictionary";
import { stripLocalePrefix } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/sports", labelKey: "hubs.sportsNavHub", exact: true },
  { href: "/sports/teams", labelKey: "hubs.sportsNavTeams", exact: false },
  { href: "/sports/players", labelKey: "hubs.sportsNavPlayers", exact: false },
] as const;

export function SportsNav() {
  const pathname = usePathname();
  const path = stripLocalePrefix(pathname || "/");
  const { t } = useDictionary();

  return (
    <nav className="inline-flex flex-wrap gap-1 rounded-xl bg-muted/60 p-1 border border-border/50">
      {LINKS.map((link) => {
        const active = link.exact
          ? path === link.href
          : path === link.href || path.startsWith(`${link.href}/`);
        return (
          <LocaleLink
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(link.labelKey)}
          </LocaleLink>
        );
      })}
    </nav>
  );
}
