import { DollarSign, TrendingUp, Wallet, CreditCard } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SOURCES = [
  { src: "Subscriptions", monthly: 32400 },
  { src: "Sponsored articles", monthly: 8200 },
  { src: "Ads (Google)", monthly: 6100 },
  { src: "Tips", monthly: 1500 },
];

export default function AdminRevenuePage() {
  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          Revenue
        </h1>
        <p className="text-muted-foreground mt-1">
          Control ad placements, subscription pricing, and creator payouts.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="MRR" value="$48.2K" delta={14} icon={<TrendingUp className="h-5 w-5" />} color="from-emerald-500 to-teal-500" index={0} />
        <StatCard label="ARR" value="$579K" delta={22} icon={<DollarSign className="h-5 w-5" />} color="from-neon-purple to-neon-pink" index={1} />
        <StatCard label="Payouts (mo)" value="$31.7K" delta={9} icon={<Wallet className="h-5 w-5" />} color="from-neon-blue to-neon-cyan" index={2} />
        <StatCard label="Active subs" value="2,148" delta={5} icon={<CreditCard className="h-5 w-5" />} color="from-neon-orange to-neon-pink" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-bold mb-5">Revenue breakdown (30d)</h2>
          {SOURCES.map((s) => (
            <div key={s.src} className="py-3 border-b last:border-0 border-border/40">
              <div className="flex justify-between text-sm">
                <span>{s.src}</span>
                <span className="font-semibold">${s.monthly.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"
                  style={{ width: `${(s.monthly / 32400) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold mb-2">Monetization controls</h2>
          {[
            { k: "Ads", d: "Google AdSense across articles." },
            { k: "Tips", d: "Allow readers to tip creators." },
            { k: "Subscriptions", d: "Paid memberships." },
            { k: "Sponsored", d: "Allow brand collaborations." },
            { k: "Affiliate links", d: "Auto-rewrite affiliate URLs." },
          ].map((row) => (
            <div key={row.k} className="flex items-center justify-between py-3 border-b last:border-0 border-border/40">
              <div>
                <Label className="text-sm font-medium">{row.k}</Label>
                <p className="text-xs text-muted-foreground">{row.d}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
