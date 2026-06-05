"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/sports", label: "Hub", exact: true },
  { href: "/sports/teams", label: "Teams", exact: false },
  { href: "/sports/players", label: "Find Player", exact: false },
];

export function SportsNav() {
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
              "rounded-lg px-4 py-2 text-sm font-medium transition-all",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
