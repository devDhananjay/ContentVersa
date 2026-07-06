"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavDropdown } from "@/lib/site/nav-config";
import { isDropdownActive, isNavActive } from "@/lib/site/nav-config";
import { cn } from "@/lib/utils";

export function NavDropdown({
  group,
  immersive,
}: {
  group: NavDropdown;
  immersive?: boolean;
}) {
  const pathname = usePathname();
  const active = isDropdownActive(pathname, group.items);
  const Icon = group.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs xl:text-sm font-medium outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-neon-purple/40",
          immersive
            ? active
              ? "bg-white/15 text-white"
              : "text-white/80 hover:bg-white/10 hover:text-white"
            : active
              ? "bg-accent/15 text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <Icon className="h-3.5 w-3.5 opacity-80" />
        {group.label}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 rounded-2xl border-border/60 bg-popover/95 p-2 backdrop-blur-xl shadow-2xl"
      >
        {group.items.map((item) => {
          const ItemIcon = item.icon;
          const itemActive = isNavActive(pathname, item.href);
          return (
            <DropdownMenuItem key={item.href} asChild className="p-0 focus:bg-transparent">
              <Link
                href={item.href}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 transition-colors",
                  itemActive
                    ? "bg-neon-purple/10 text-foreground"
                    : "hover:bg-muted/60"
                )}
              >
                {ItemIcon ? (
                  <ItemIcon className="mt-0.5 h-4 w-4 shrink-0 text-neon-purple" />
                ) : null}
                <span>
                  <span className="block text-sm font-semibold">{item.label}</span>
                  {item.description ? (
                    <span className="block text-[11px] text-muted-foreground leading-snug">
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
