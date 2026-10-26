"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocaleLink } from "@/components/i18n/locale-link";
import { useDictionary } from "@/components/i18n/use-dictionary";
import type { NavDropdown } from "@/lib/site/nav-config";
import { isDropdownActive, isNavActive } from "@/lib/site/nav-config";
import { NAV_GROUP_I18N, NAV_ITEM_I18N } from "@/lib/i18n/nav-labels";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function NavDropdown({
  group,
  immersive,
}: {
  group: NavDropdown;
  immersive?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useDictionary();
  const active = isDropdownActive(pathname, group.items);
  const Icon = group.icon;
  const groupLabel = NAV_GROUP_I18N[group.id]
    ? t(NAV_GROUP_I18N[group.id], group.label)
    : group.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium outline-none transition-colors",
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
        {groupLabel}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 rounded-2xl border-border/60 bg-popover/95 p-2 backdrop-blur-xl shadow-2xl"
      >
        {group.items.map((item) => {
          const ItemIcon = item.icon;
          const itemActive = isNavActive(pathname, item.href);
          const keys = NAV_ITEM_I18N[item.href];
          const label = keys ? t(keys.label, item.label) : item.label;
          const description =
            keys?.description && item.description
              ? t(keys.description, item.description)
              : item.description;
          return (
            <DropdownMenuItem key={item.href} asChild className="p-0 focus:bg-transparent">
              <LocaleLink
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
                  <span className="block text-sm font-semibold">{label}</span>
                  {description ? (
                    <span className="block text-[11px] text-muted-foreground leading-snug">
                      {description}
                    </span>
                  ) : null}
                </span>
              </LocaleLink>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
