"use client";

import { usePathname } from "next/navigation";
import { Briefcase, Building2, Landmark } from "lucide-react";
import { LocaleLink } from "@/components/i18n/locale-link";
import { useDictionary } from "@/components/i18n/use-dictionary";
import { stripLocalePrefix } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/jobs", labelKey: "hubs.jobsNavOverview", icon: Briefcase, exact: true },
  { href: "/jobs/govt", labelKey: "hubs.jobsNavGovt", icon: Landmark, exact: false },
  { href: "/jobs/private", labelKey: "hubs.jobsNavPrivate", icon: Building2, exact: false },
] as const;

export function JobsNav() {
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
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <link.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t(link.labelKey)}
          </LocaleLink>
        );
      })}
    </nav>
  );
}
