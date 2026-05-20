"use client";

import * as React from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function useSignOut() {
  const [loading, setLoading] = React.useState(false);

  const signOut = React.useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      setLoading(false);
      // Full reload so navbar/session state clears immediately
      window.location.href = "/";
    }
  }, []);

  return { signOut, loading };
}

interface SignOutButtonProps extends ButtonProps {
  showIcon?: boolean;
  label?: string;
}

export function SignOutButton({
  showIcon = true,
  label = "Log out",
  className,
  variant = "ghost",
  size = "default",
  ...props
}: SignOutButtonProps) {
  const { signOut, loading } = useSignOut();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      disabled={loading || props.disabled}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) signOut();
      }}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : showIcon ? (
        <LogOut className="h-4 w-4" />
      ) : null}
      {label}
    </Button>
  );
}
