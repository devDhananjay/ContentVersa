"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

/** One-tap path into push settings from sports/finance hubs. */
export function HubPushCta({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="container">
      <div className="flex flex-col gap-3 rounded-2xl border border-neon-cyan/25 bg-neon-cyan/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-neon-cyan/15 p-2">
            <Bell className="h-4 w-4 text-neon-cyan" />
          </div>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link href="/dashboard/settings">Enable alerts</Link>
        </Button>
      </div>
    </div>
  );
}
