"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreatorDashboardLink({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
        "text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
        className
      )}
    >
      <LayoutDashboard className="h-4 w-4" />
      Creator dashboard
    </Link>
  );
}
