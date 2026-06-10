"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn, Settings, LogOut, Shield } from "lucide-react";
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
import { getInitials } from "@/lib/utils";

export function UserNav() {
  const { user, loading } = useSession();
  const { signOut, loading: signingOut } = useSignOut();

  if (loading) {
    return (
      <div className="h-9 w-24 rounded-lg bg-muted/50 animate-pulse" aria-hidden />
    );
  }

  if (!user) {
    return (
      <Link href="/auth/sign-in">
        <Button variant="outline" size="sm" className="gap-1.5">
          <LogIn className="h-4 w-4" />
          Sign in
        </Button>
      </Link>
    );
  }

  const displayName = user.name || user.username || "Account";
  const displayEmail = user.email;
  const isAdmin = isAdminRole(user.role);

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {isAdmin && (
        <Link href="/admin">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0 border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
          >
            <Shield className="h-4 w-4 shrink-0" />
            Admin View
          </Button>
        </Link>
      )}
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 pl-1.5 pr-2.5 max-w-[11rem] shrink-0">
          <Avatar className="h-7 w-7 shrink-0">
            {user.image ? (
              <AvatarImage src={user.image} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-[10px]">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden xl:inline truncate min-w-0">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{displayName}</p>
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
            <Link href="/admin" className="cursor-pointer text-orange-600 dark:text-orange-400">
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
    </div>
  );
}

export function MobileUserNav() {
  const { user, loading } = useSession();
  const { signOut, loading: signingOut } = useSignOut();

  if (loading) {
    return <div className="flex-1 h-10 rounded-lg bg-muted/50 animate-pulse" aria-hidden />;
  }

  if (!user) {
    return (
      <Link href="/auth/sign-in" className="flex-1">
        <Button variant="outline" className="w-full gap-2">
          <LogIn className="h-4 w-4" />
          Sign in
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
