"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, BadgeCheck, Eye, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { formatNumber, getInitials } from "@/lib/utils";
import type { AdminUserRow } from "@/lib/data/admin-data";

const ALL_ROLES = [
  { value: "USER", label: "User" },
  { value: "VERIFIED_CREATOR", label: "Verified creator" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
] as const;

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
}: {
  users: AdminUserRow[];
  isSuperAdmin: boolean;
}) {
  const [q, setQ] = React.useState("");
  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(q.toLowerCase()) ||
      u.username.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        {isSuperAdmin && <AddUserDialog isSuperAdmin={isSuperAdmin} />}
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground bg-muted/40">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Blogs</th>
              <th className="p-4">Followers</th>
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
                <td className="p-4 font-semibold">{u.blogCount}</td>
                <td className="p-4">{formatNumber(u.followerCount)}</td>
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
          <p className="text-sm text-muted-foreground py-10 text-center">No users found.</p>
        )}
      </div>
    </div>
  );
}
