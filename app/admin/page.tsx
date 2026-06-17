import Link from "next/link";
import Image from "next/image";
import { Users2, FileText, AlertOctagon, ArrowRight, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminOverview } from "@/lib/data/admin-data";
import { formatNumber } from "@/lib/utils";

export default async function AdminOverview() {
  const data = await getAdminOverview();

  const pendingCount = data?.pendingCount ?? 0;
  const publishedCount = data?.publishedCount ?? 0;
  const userCount = data?.userCount ?? 0;
  const pendingBlogs = data?.pendingBlogs ?? [];

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Platform overview</p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
          ContentVerse <span className="text-gradient">Admin</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Use the sidebar or <strong>Admin View</strong> anytime from the navbar or your profile menu.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/users" className="block">
          <StatCard
            label="Users"
            value={formatNumber(userCount)}
            delta={0}
            icon={<Users2 className="h-5 w-5" />}
            color="from-neon-blue to-neon-cyan"
            index={0}
          />
        </Link>
        <Link href="/admin/blogs?status=published" className="block">
          <StatCard
            label="Published"
            value={formatNumber(publishedCount)}
            delta={0}
            icon={<FileText className="h-5 w-5" />}
            color="from-neon-purple to-neon-pink"
            index={1}
          />
        </Link>
        <StatCard
          label="Pending review"
          value={String(pendingCount)}
          delta={pendingCount > 0 ? pendingCount : 0}
          icon={<AlertOctagon className="h-5 w-5" />}
          color="from-red-500 to-orange-500"
          index={2}
        />
        <StatCard
          label="Drafts"
          value={String(data?.draftCount ?? 0)}
          delta={0}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="from-neon-orange to-neon-pink"
          index={3}
        />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Pending moderation</h2>
            <Link href="/admin/moderation">
              <Button variant="gradient" size="sm" className="gap-1.5">
                Open queue <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {pendingBlogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No blogs waiting for approval.
              </p>
            ) : (
              pendingBlogs.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 p-3 rounded-xl border bg-background/60"
                >
                  <div className="relative h-10 w-14 rounded-md bg-muted shrink-0 overflow-hidden">
                    {b.coverImage ? (
                      <Image src={b.coverImage} alt="" fill sizes="56px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{b.title}</p>
                    <p className="text-xs text-muted-foreground">
                      By {b.author.name} · {b.category}
                    </p>
                  </div>
                  <Badge variant="warning">PENDING</Badge>
                  <Link href={`/admin/blogs/${b.id}`}>
                    <Button size="sm" variant="outline">
                      View details
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Quick links</h2>
          {[
            { href: "/admin/moderation", label: "Approve blogs", desc: "Review & publish submissions" },
            { href: "/admin/reels-moderation", label: "Approve reels", desc: "Review flagged short videos" },
            { href: "/admin/ai-articles", label: "AI articles", desc: "Generate hot-topic posts with one click" },
            { href: "/admin/blogs", label: "All blogs", desc: "Pending, published, rejected — full content" },
            { href: "/admin/users", label: "All users", desc: "Profiles, emails, post counts" },
            { href: "/admin/settings", label: "CMS settings", desc: "Platform configuration" },
            { href: "/admin/account", label: "Admin account", desc: "Your admin profile" },
            { href: "/dashboard", label: "Creator dashboard", desc: "Back to your studio" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block p-3 rounded-xl border hover:border-orange-500/40 transition-colors"
            >
              <p className="font-semibold text-sm">{link.label}</p>
              <p className="text-xs text-muted-foreground">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
