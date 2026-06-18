import { redirect } from "next/navigation";
import { Wallet, IndianRupee, Gift, Megaphone, Crown, Coffee } from "lucide-react";
import { WithdrawButton } from "@/components/dashboard/withdraw-button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardDataCached } from "@/lib/data/dashboard-data";
import { formatINR } from "@/lib/utils";

const ICONS = {
  ads: Megaphone,
  subscription: Crown,
  tip: Coffee,
  sponsored: Gift,
};

const COLORS: Record<string, string> = {
  ads: "from-neon-blue to-neon-cyan",
  subscription: "from-neon-purple to-neon-pink",
  tip: "from-neon-orange to-neon-pink",
  sponsored: "from-emerald-500 to-teal-500",
};

export default async function EarningsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/auth/sign-in?next=/dashboard/earnings");

  const data = await getDashboardDataCached(session);
  const s = data?.stats;
  const sources = data?.revenueSources ?? [];
  const payouts = data?.payouts ?? [];

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Earnings
          </h1>
          <p className="text-muted-foreground mt-1">
            Your wallet and revenue — mapped to your account only.
          </p>
        </div>
        <WithdrawButton balanceInr={s?.walletBalanceRaw ?? 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="rounded-3xl border-gradient bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Wallet balance
          </p>
          <p className="font-display text-5xl font-extrabold mt-2 text-gradient">
            {s?.walletBalance ?? formatINR(0)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Available for payout · INR</p>
        </div>
        <StatCard
          label="Lifetime earnings"
          value={s?.lifetimeEarnings ?? formatINR(0)}
          delta={s?.earningsDelta ?? 0}
          icon={<IndianRupee className="h-5 w-5" />}
          color="from-neon-purple to-neon-pink"
          index={0}
        />
        <StatCard
          label="This month"
          value={s?.earnings ?? formatINR(0)}
          delta={s?.earningsDelta ?? 0}
          icon={<Wallet className="h-5 w-5" />}
          color="from-neon-orange to-neon-pink"
          index={1}
        />
      </div>

      <h2 className="font-display text-xl font-bold mb-4">Revenue sources (30d)</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sources.map((row) => {
          const Icon = ICONS[row.iconKey] ?? Gift;
          const color = COLORS[row.iconKey] ?? "from-neon-purple to-neon-pink";
          return (
            <div key={row.source} className="rounded-2xl border bg-card p-5">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4">
                {row.source}
              </p>
              <p className="font-display text-2xl font-extrabold mt-1">
                {formatINR(row.amount)}
              </p>
            </div>
          );
        })}
      </div>

      <h2 className="font-display text-xl font-bold mt-10 mb-4">Payout history</h2>
      <div className="rounded-2xl border bg-card overflow-hidden">
        {payouts.length > 0 ? (
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
              {payouts.map((p, i) => (
                <tr key={`${p.date}-${p.amount}-${i}`} className="border-t border-border/40 text-sm">
                  <td className="p-4">{p.date}</td>
                  <td className="p-4">{p.method}</td>
                  <td className="p-4 font-semibold">{formatINR(p.amount)}</td>
                  <td className="p-4">
                    <Badge variant="success">{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No payouts yet. Tips and revenue will show up here.
          </p>
        )}
      </div>
    </div>
  );
}
