"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/components/auth/use-session";
import { isAdminRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type AdminViewButtonProps = {
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "gradient" | "outline" | "default";
  showBadge?: number;
  fullWidth?: boolean;
  /** Icon only — saves navbar space on smaller desktops */
  compact?: boolean;
};

export function AdminViewButton({
  className,
  size = "sm",
  variant = "outline",
  showBadge,
  fullWidth,
  compact,
}: AdminViewButtonProps) {
  const { user, loading } = useSession();

  if (loading || !isAdminRole(user?.role)) return null;

  return (
    <Link href="/admin" className={cn(fullWidth && "w-full", className)}>
      <Button
        type="button"
        variant={variant === "gradient" ? "gradient" : variant}
        size={compact ? "icon" : size}
        className={cn(
          "gap-1.5",
          fullWidth && "w-full",
          compact && "h-9 w-9 shrink-0",
          variant === "outline" &&
            "border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
        )}
        aria-label="Admin View"
      >
        <Shield className="h-4 w-4 shrink-0" />
        {!compact && "Admin View"}
        {showBadge !== undefined && showBadge > 0 && (
          <Badge variant="orange" className="ml-0.5 h-5 min-w-5 rounded-full px-1.5 py-0 text-[10px]">
            {showBadge}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
