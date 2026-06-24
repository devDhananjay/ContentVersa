"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Building2, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/jobs", label: "Overview", icon: Briefcase, exact: true },
  { href: "/jobs/govt", label: "Govt Jobs", icon: Landmark, exact: false },
  { href: "/jobs/private", label: "Private Jobs", icon: Building2, exact: false },
];

export function JobsNav() {
  const pathname = usePathname();

  return (
    <nav className="inline-flex flex-wrap gap-1 rounded-xl bg-muted/60 p-1 border border-border/50">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname?.startsWith(link.href);
        return (
          <Link
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
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
