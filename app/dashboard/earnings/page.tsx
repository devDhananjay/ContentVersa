import { Wallet, DollarSign, Gift, Megaphone, Crown, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";

const SOURCES = [
  { source: "Ad Revenue", icon: Megaphone, amount: 420.5, color: "from-neon-blue to-neon-cyan" },
  { source: "Subscriptions", icon: Crown, amount: 612.0, color: "from-neon-purple to-neon-pink" },
  { source: "Tips", icon: Coffee, amount: 84.0, color: "from-neon-orange to-neon-pink" },
  { source: "Sponsored", icon: Gift, amount: 320.0, color: "from-emerald-500 to-teal-500" },
];

const PAYOUTS = [
  { date: "2026-05-01", method: "Stripe", amount: 1240, status: "Paid" },
  { date: "2026-04-01", method: "Stripe", amount: 980, status: "Paid" },
  { date: "2026-03-01", method: "Stripe", amount: 720, status: "Paid" },
  { date: "2026-02-01", method: "Stripe", amount: 540, status: "Paid" },
];

export default function EarningsPage() {
  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Earnings
          </h1>
          <p className="text-muted-foreground mt-1">
            Track ads, tips, subscriptions and sponsored revenue in one place.
          </p>
        </div>
        <Button variant="gradient" className="gap-2">
          <Wallet className="h-4 w-4" /> Withdraw
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="rounded-3xl border-gradient bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Wallet balance
          </p>
          <p className="font-display text-5xl font-extrabold mt-2 text-gradient">$1,436.50</p>
          <p className="text-xs text-muted-foreground mt-2">Available for payout · USD</p>
        </div>
        <StatCard label="Lifetime earnings" value="$8,420" delta={24} icon={<DollarSign className="h-5 w-5" />} color="from-neon-purple to-neon-pink" index={0} />
        <StatCard label="This month" value="$1,240" delta={42} icon={<Wallet className="h-5 w-5" />} color="from-neon-orange to-neon-pink" index={1} />
      </div>

      <h2 className="font-display text-xl font-bold mb-4">Revenue sources (30d)</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SOURCES.map((s, i) => (
          <div key={s.source} className="rounded-2xl border bg-card p-5">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4">
              {s.source}
            </p>
            <p className="font-display text-2xl font-extrabold mt-1">${s.amount.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl font-bold mt-10 mb-4">Payout history</h2>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground bg-muted/40">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Method</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {PAYOUTS.map((p) => (
              <tr key={p.date} className="border-t border-border/40 text-sm">
                <td className="p-4">{p.date}</td>
                <td className="p-4">{p.method}</td>
                <td className="p-4 font-semibold">${p.amount.toFixed(2)}</td>
                <td className="p-4">
                  <Badge variant="success">{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
