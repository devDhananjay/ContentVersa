import Link from "next/link";
import { Users2, FileText, Wallet, AlertOctagon, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BLOGS } from "@/lib/data/blogs";

export default function AdminOverview() {
  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Platform overview</p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
          ContentVerse <span className="text-gradient">Admin</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active users" value="42.1K" delta={12} icon={<Users2 className="h-5 w-5" />} color="from-neon-blue to-neon-cyan" index={0} />
        <StatCard label="Posts (30d)" value="3,284" delta={18} icon={<FileText className="h-5 w-5" />} color="from-neon-purple to-neon-pink" index={1} />
        <StatCard label="MRR" value="$48.2K" delta={9} icon={<Wallet className="h-5 w-5" />} color="from-neon-orange to-neon-pink" index={2} />
        <StatCard label="Pending review" value="4" delta={-22} icon={<AlertOctagon className="h-5 w-5" />} color="from-red-500 to-orange-500" index={3} />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Pending moderation</h2>
            <Link href="/admin/moderation">
              <Button variant="outline" size="sm" className="gap-1.5">
                Open queue <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {BLOGS.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border bg-background/60">
                <div className="h-10 w-10 rounded-md bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground">By {b.author.name} · {b.category}</p>
                </div>
                <Badge variant="warning">PENDING</Badge>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-5">
          <h2 className="font-display text-xl font-bold">Platform health</h2>
          {[
            { k: "Uptime (30d)", v: "99.97%", color: "text-green-500" },
            { k: "Avg response", v: "182ms", color: "text-neon-cyan" },
            { k: "Error rate", v: "0.02%", color: "text-green-500" },
            { k: "Cache hit", v: "94%", color: "text-neon-purple" },
          ].map((row) => (
            <div key={row.k} className="flex items-center justify-between py-2 border-b last:border-0 border-border/40">
              <span className="text-sm text-muted-foreground">{row.k}</span>
              <span className={`font-display font-bold ${row.color}`}>{row.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
