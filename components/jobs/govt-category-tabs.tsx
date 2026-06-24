"use client";

import Link from "next/link";
import { GOVT_CATEGORIES } from "@/lib/jobs/constants";
import type { SarkariCategory } from "@/lib/jobs/types";
import { cn } from "@/lib/utils";

export function GovtCategoryTabs({ active }: { active: SarkariCategory }) {
  return (
    <div className="overflow-x-auto pb-1 -mx-1 px-1">
      <div
        className="inline-flex min-w-full sm:min-w-0 gap-1 rounded-xl border border-border/50 bg-muted/40 p-1"
        role="tablist"
        aria-label="Government job categories"
      >
        {GOVT_CATEGORIES.map((category) => {
          const href = `/jobs/govt?cat=${category.id}`;
          const isActive = active === category.id;
          return (
            <Link
              key={category.id}
              href={href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {category.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
