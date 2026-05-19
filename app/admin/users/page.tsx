"use client";

import * as React from "react";
import { Ban, BadgeCheck, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AUTHORS } from "@/lib/data/blogs";
import { formatNumber, getInitials } from "@/lib/utils";

const ROLES = ["USER", "VERIFIED_CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"] as const;

const USERS = AUTHORS.map((a, i) => ({
  ...a,
  role: ROLES[i % ROLES.length],
  banned: false,
  warnings: i,
}));

export default function AdminUsersPage() {
  const [q, setQ] = React.useState("");
  const filtered = USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(q.toLowerCase()) ||
      u.username.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          Users
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage roles, verify creators and handle bans.
        </p>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground bg-muted/40">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Followers</th>
              <th className="p-4">Warnings</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-border/40 text-sm">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.avatar} alt={u.name} />
                      <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold">{u.name}</p>
                        {u.verified && <BadgeCheck className="h-3.5 w-3.5 text-neon-cyan" />}
                      </div>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge
                    variant={u.role === "ADMIN" || u.role === "SUPER_ADMIN" ? "destructive" : u.role === "VERIFIED_CREATOR" ? "neon" : "secondary"}
                  >
                    {u.role.replaceAll("_", " ")}
                  </Badge>
                </td>
                <td className="p-4 font-semibold">{formatNumber(u.followers)}</td>
                <td className="p-4">{u.warnings}</td>
                <td className="p-4 text-right space-x-1">
                  <Button variant="outline" size="sm">Edit role</Button>
                  <Button variant="ghost" size="icon">
                    <Ban className="h-4 w-4 text-destructive" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
