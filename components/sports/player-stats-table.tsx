import type { PlayerStatsTable } from "@/lib/sports/types";

interface PlayerStatsTableViewProps {
  title: string;
  stats: PlayerStatsTable | null;
}

export function PlayerStatsTableView({ title, stats }: PlayerStatsTableViewProps) {
  if (!stats || !stats.rows.length) return null;

  const formats = stats.headers.slice(1);

  return (
    <div className="rounded-2xl border overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-display font-bold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[480px]">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="text-left py-2.5 px-4 font-medium">Stat</th>
              {formats.map((h) => (
                <th key={h} className="text-right py-2.5 px-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.rows.map((row) => (
              <tr key={row.label} className="border-b border-border/40 last:border-0">
                <td className="py-2.5 px-4 font-medium">{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={i} className="text-right py-2.5 px-3 font-mono">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
