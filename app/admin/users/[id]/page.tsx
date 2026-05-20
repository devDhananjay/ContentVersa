import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Eye, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeUserPassword } from "@/components/admin/change-user-password";
import { getAdminUserDetail } from "@/lib/data/admin-data";
import { getCurrentUser } from "@/lib/auth";
import { formatNumber, getInitials } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  PUBLISHED: "success",
  PENDING: "warning",
  DRAFT: "secondary",
  REJECTED: "destructive",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCurrentUser();
  const user = await getAdminUserDetail(id);
  if (!user) notFound();
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const byStatus = {
    published: user.blogs.filter((b) => b.status === "PUBLISHED").length,
    pending: user.blogs.filter((b) => b.status === "PENDING").length,
    draft: user.blogs.filter((b) => b.status === "DRAFT").length,
    rejected: user.blogs.filter((b) => b.status === "REJECTED").length,
  };

  return (
    <div className="container py-8 max-w-5xl">
      <Link href="/admin/users">
        <Button variant="ghost" size="sm" className="gap-1.5 mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4" /> All users
        </Button>
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Avatar className="h-20 w-20">
          {user.image ? <AvatarImage src={user.image} alt={user.name || user.username} /> : null}
          <AvatarFallback className="text-xl">{getInitials(user.name || user.username)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-extrabold">{user.name || user.username}</h1>
            <Badge
              variant={
                user.role === "SUPER_ADMIN" || user.role === "ADMIN"
                  ? "destructive"
                  : "secondary"
              }
            >
              {user.role.replace(/_/g, " ")}
            </Badge>
            {user.isVerified && <Badge variant="neon">Verified</Badge>}
            {user.banned && <Badge variant="destructive">Banned</Badge>}
          </div>
          <p className="text-muted-foreground mt-1">@{user.username}</p>
          <p className="flex items-center gap-1.5 text-sm mt-2">
            <Mail className="h-4 w-4" /> {user.email}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <Calendar className="h-4 w-4" /> Joined {user.createdAt.toLocaleDateString()}
          </p>
          {user.bio && <p className="mt-4 text-sm">{user.bio}</p>}
          <p className="text-xs text-muted-foreground mt-2">
            Login: {user.hasPassword ? "Email + password" : "Google OAuth only (no password set)"}
          </p>
        </div>
      </div>

      {isSuperAdmin && (
        <ChangeUserPassword
          userId={user.id}
          userEmail={user.email}
          hasPassword={user.hasPassword}
        />
      )}

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total blogs", value: user.blogCount },
          { label: "Published", value: byStatus.published },
          { label: "Pending", value: byStatus.pending },
          { label: "Followers", value: formatNumber(user.followerCount) },
          { label: "Profile views", value: formatNumber(user.totalViews) },
          { label: "Total likes", value: formatNumber(user.totalLikes) },
          { label: "Warnings", value: user.warnings },
          { label: "Following", value: user.followingCount },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className="font-display text-2xl font-extrabold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Blogs by this user ({user.blogs.length})
        </h2>
        {user.blogs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No blogs yet.</p>
        ) : (
          <div className="space-y-3">
            {user.blogs.map((b) => (
              <Link
                key={b.id}
                href={`/admin/blogs/${b.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:border-orange-500/40 transition-colors"
              >
                <div className="relative h-14 w-20 rounded-lg bg-muted overflow-hidden shrink-0">
                  {b.coverImage ? (
                    <Image src={b.coverImage} alt="" fill sizes="80px" className="object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{b.excerpt || "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNumber(b.views)} views · {b.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>{b.status}</Badge>
                <Button variant="outline" size="sm" className="gap-1 shrink-0">
                  <Eye className="h-3.5 w-3.5" /> View
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link href={`/profile/${user.username}`} target="_blank">
          <Button variant="outline">Public profile</Button>
        </Link>
      </div>
    </div>
  );
}
