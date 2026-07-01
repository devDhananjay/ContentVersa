"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Eye, Loader2, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { AdminListFilters, useAdminFilters } from "@/components/admin/admin-list-filters";
import { formatNumber, getInitials } from "@/lib/utils";
import {
  formatAdminDate,
  inDateRange,
  matchesSearch,
} from "@/lib/admin/list-filters";
import type { AdminUserRow } from "@/lib/data/admin-data";

const ALL_ROLES = [
  { value: "USER", label: "User" },
  { value: "VERIFIED_CREATOR", label: "Verified creator" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
] as const;

const FILTER_DEFAULTS = {
  q: "",
  role: "all",
  status: "all",
  verified: "all",
  push: "all",
  dateFrom: "",
  dateTo: "",
  sort: "newest",
};

type UserFilters = typeof FILTER_DEFAULTS;

function sortUsers(rows: AdminUserRow[], sort: string): AdminUserRow[] {
  const copy = [...rows];
  switch (sort) {
    case "oldest":
      return copy.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "blogs":
      return copy.sort((a, b) => b.blogCount - a.blogCount);
    case "followers":
      return copy.sort((a, b) => b.followerCount - a.followerCount);
    case "name":
      return copy.sort((a, b) =>
        (a.name || a.username).localeCompare(b.name || b.username)
      );
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

function applyUserFilters(rows: AdminUserRow[], f: UserFilters): AdminUserRow[] {
  const filtered = rows.filter((u) => {
    if (!matchesSearch(f.q, u.name, u.username, u.email)) return false;
    if (f.role !== "all" && u.role !== f.role) return false;
    if (f.status === "banned" && !u.banned) return false;
    if (f.status === "active" && u.banned) return false;
    if (f.verified === "yes" && !u.isVerified) return false;
    if (f.verified === "no" && u.isVerified) return false;
    if (f.push === "on" && !u.pushEnabled) return false;
    if (f.push === "off" && u.pushEnabled) return false;
    if (!inDateRange(u.createdAt, f.dateFrom, f.dateTo)) return false;
    return true;
  });
  return sortUsers(filtered, f.sort);
}

function RoleSelect({
  userId,
  currentRole,
  isSuperAdmin,
}: {
  userId: string;
  currentRole: string;
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = React.useState(currentRole);
  const [loading, setLoading] = React.useState(false);

  const options = isSuperAdmin
    ? ALL_ROLES
    : ALL_ROLES.filter((r) => r.value !== "ADMIN" && r.value !== "SUPER_ADMIN");

  const onChange = async (newRole: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      setRole(newRole);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      <Select value={role} onValueChange={onChange} disabled={loading}>
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function AdminUsersTable({
  users,
  isSuperAdmin,
  pushEnabledCount,
}: {
  users: AdminUserRow[];
  isSuperAdmin: boolean;
  pushEnabledCount: number;
}) {
  const { filters, set, clear, hasActive } = useAdminFilters(FILTER_DEFAULTS);
  const filtered = applyUserFilters(users, filters);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <AdminListFilters
            search={{
              value: filters.q,
              onChange: (v) => set("q", v),
              placeholder: "Search name, username, email…",
            }}
            dateFrom={{
              value: filters.dateFrom,
              onChange: (v) => set("dateFrom", v),
              label: "Joined from",
            }}
            dateTo={{
              value: filters.dateTo,
              onChange: (v) => set("dateTo", v),
              label: "Joined to",
            }}
            selects={[
              {
                id: "role",
                value: filters.role,
                onChange: (v) => set("role", v),
                placeholder: "Role",
                options: [
                  { value: "all", label: "All roles" },
                  ...ALL_ROLES.map((r) => ({ value: r.value, label: r.label })),
                ],
              },
              {
                id: "status",
                value: filters.status,
                onChange: (v) => set("status", v),
                placeholder: "Account",
                options: [
                  { value: "all", label: "All accounts" },
                  { value: "active", label: "Active only" },
                  { value: "banned", label: "Banned only" },
                ],
              },
              {
                id: "verified",
                value: filters.verified,
                onChange: (v) => set("verified", v),
                placeholder: "Verified",
                options: [
                  { value: "all", label: "Any" },
                  { value: "yes", label: "Verified creators" },
                  { value: "no", label: "Not verified" },
                ],
              },
              {
                id: "push",
                value: filters.push,
                onChange: (v) => set("push", v),
                placeholder: "Push alerts",
                options: [
                  { value: "all", label: "Any" },
                  { value: "on", label: "Push enabled" },
                  { value: "off", label: "Push off" },
                ],
              },
              {
                id: "sort",
                value: filters.sort,
                onChange: (v) => set("sort", v),
                placeholder: "Sort by",
                options: [
                  { value: "newest", label: "Newest signup" },
                  { value: "oldest", label: "Oldest signup" },
                  { value: "blogs", label: "Most blogs" },
                  { value: "followers", label: "Most followers" },
                  { value: "name", label: "Name A–Z" },
                ],
                className: "w-[170px]",
              },
            ]}
            resultCount={filtered.length}
            showClear={hasActive}
            onClear={clear}
          />
        </div>
        {isSuperAdmin ? <AddUserDialog isSuperAdmin={isSuperAdmin} /> : null}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="neon" className="gap-1.5 py-1.5 px-3">
          <Bell className="h-3.5 w-3.5" />
          {pushEnabledCount} / {users.length} users allowed browser push
        </Badge>
        <span className="text-xs text-muted-foreground">
          Shown per user when they grant permission and a device token is saved.
        </span>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[1040px]">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground bg-muted/40">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Blogs</th>
              <th className="p-4">Followers</th>
              <th className="p-4">Push alerts</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-border/40 text-sm hover:bg-muted/20">
                <td className="p-4">
                  <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {u.image ? <AvatarImage src={u.image} alt={u.name || u.username} /> : null}
                      <AvatarFallback>{getInitials(u.name || u.username)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold">{u.name || u.username}</p>
                        {u.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-neon-cyan" />}
                        {u.banned && <Badge variant="destructive">Banned</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                  </Link>
                </td>
                <td className="p-4 text-muted-foreground">{u.email}</td>
                <td className="p-4">
                  {isSuperAdmin ? (
                    <RoleSelect userId={u.id} currentRole={u.role} isSuperAdmin={isSuperAdmin} />
                  ) : (
                    <Badge
                      variant={
                        u.role === "ADMIN" || u.role === "SUPER_ADMIN"
                          ? "destructive"
                          : u.role === "VERIFIED_CREATOR"
                            ? "neon"
                            : "secondary"
                      }
                    >
                      {u.role.replace(/_/g, " ")}
                    </Badge>
                  )}
                </td>
                <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                  {formatAdminDate(u.createdAt)}
                </td>
                <td className="p-4 font-semibold">{u.blogCount}</td>
                <td className="p-4">{formatNumber(u.followerCount)}</td>
                <td className="p-4">
                  {u.pushEnabled ? (
                    <Badge variant="success" className="gap-1" title={`${u.pushDeviceCount} device(s)`}>
                      <Bell className="h-3 w-3" />
                      Allowed
                      {u.pushDeviceCount > 1 ? ` (${u.pushDeviceCount})` : ""}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1 text-muted-foreground">
                      <BellOff className="h-3 w-3" />
                      Off
                    </Badge>
                  )}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/users/${u.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-10 text-center">No users match your filters.</p>
        )}
      </div>
    </div>
  );
}
