import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AdminViewBanner({ pendingCount }: { pendingCount: number }) {
  return (
    <div className="border-b border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-transparent">
      <div className="container flex flex-wrap items-center justify-between gap-3 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-orange-500" />
          <span className="font-medium">Admin View</span>
          <span className="text-muted-foreground hidden sm:inline">
            — approve blogs, manage users & platform
          </span>
          {pendingCount > 0 && (
            <Badge variant="orange" className="rounded-full">
              {pendingCount} pending
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Link href="/admin/moderation">
              <Button size="sm" variant="gradient" className="gap-1.5 h-8">
                Review queue <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
          <Link href="/dashboard">
            <Button size="sm" variant="outline" className="h-8">
              Exit to creator dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
