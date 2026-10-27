"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  LogIn,
  Settings,
  LogOut,
  Shield,
  Menu,
} from "lucide-react";
import { isAdminRole } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/components/auth/use-session";
import { useSignOut } from "@/components/auth/sign-out-button";
import { cn, getInitials } from "@/lib/utils";
import { useDictionary } from "@/components/i18n/use-dictionary";

export function UserNav({ immersive = false }: { immersive?: boolean }) {
  const { t } = useDictionary();
  const { user, loading } = useSession();
  const { signOut, loading: signingOut } = useSignOut();

  if (loading) {
    return (
      <div
        className="h-9 w-9 shrink-0 rounded-full bg-muted/50 animate-pulse"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Link href="/auth/sign-in">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-full px-3"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">{t("auth.signIn")}</span>
        </Button>
      </Link>
    );
  }

  const displayName = user.name || user.username || "Account";
  const displayUsername = user.username ? `@${user.username}` : "";
  const displayEmail = user.email;
  const isAdmin = isAdminRole(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "relative h-9 w-9 shrink-0 rounded-full border-border/70 p-0 shadow-sm",
            immersive && "border-white/30 bg-white/10 hover:bg-white/15"
          )}
          aria-label={`${displayName} menu`}
        >
          <Avatar className="h-full w-full rounded-full">
            {user.image ? (
              <AvatarImage src={user.image} alt={displayName} />
            ) : null}
            <AvatarFallback className="rounded-full text-[10px] font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-background shadow-sm",
              immersive
                ? "bg-white text-black"
                : "bg-foreground text-background"
            )}
            aria-hidden
          >
            <Menu className="h-2.5 w-2.5" strokeWidth={2.5} />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium truncate">{displayName}</p>
          {displayUsername ? (
            <p className="text-xs text-muted-foreground truncate">
              {displayUsername}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link
              href="/admin"
              className="cursor-pointer text-orange-600 dark:text-orange-400"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin View
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          disabled={signingOut}
          onSelect={(e) => {
            e.preventDefault();
            signOut();
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MobileUserNav() {
  const { t } = useDictionary();
  const { user, loading } = useSession();
  const { signOut, loading: signingOut } = useSignOut();

  if (loading) {
    return (
      <div className="flex-1 h-10 rounded-lg bg-muted/50 animate-pulse" aria-hidden />
    );
  }

  if (!user) {
    return (
      <Link href="/auth/sign-in" className="flex-1">
        <Button variant="outline" className="w-full gap-2">
          <LogIn className="h-4 w-4" />
          {t("auth.signIn")}
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-2 flex-1">
      <Link href="/dashboard">
        <Button variant="outline" className="w-full gap-2">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Button>
      </Link>
      {isAdminRole(user.role) && (
        <Link href="/admin">
          <Button variant="gradient" className="w-full gap-2">
            <Shield className="h-4 w-4" />
            Admin View
          </Button>
        </Link>
      )}
      <Button
        variant="outline"
        className="w-full gap-2 text-destructive hover:text-destructive"
        disabled={signingOut}
        onClick={() => signOut()}
      >
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </div>
  );
}
