import type { PointsTableRow } from "@/lib/sports/types";
import { Trophy } from "lucide-react";

interface PointsTableProps {
  rows: PointsTableRow[];
  seriesName?: string;
}

export function PointsTable({ rows, seriesName }: PointsTableProps) {
  if (!rows.length) return null;

  return (
    <div className="rounded-2xl border bg-card p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-4 w-4 text-lime-400" />
        <div>
          <h3 className="font-display font-bold">Points Table</h3>
          {seriesName && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {seriesName}
            </p>
          )}
        </div>
      </div>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="text-left py-2 pr-2 font-medium">#</th>
              <th className="text-left py-2 pr-2 font-medium">Team</th>
              <th className="text-center py-2 px-1 font-medium">P</th>
              <th className="text-center py-2 px-1 font-medium">W</th>
              <th className="text-center py-2 px-1 font-medium">L</th>
              <th className="text-center py-2 px-1 font-medium">Pts</th>
              <th className="text-right py-2 pl-1 font-medium">NRR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.teamId} className="border-b border-border/50 last:border-0">
                <td className="py-2 pr-2 text-muted-foreground">{i + 1}</td>
                <td className="py-2 pr-2 font-semibold">{row.teamName}</td>
                <td className="py-2 px-1 text-center">{row.played}</td>
                <td className="py-2 px-1 text-center">{row.won}</td>
                <td className="py-2 px-1 text-center">{row.lost}</td>
                <td className="py-2 px-1 text-center font-bold text-neon-cyan">
                  {row.points}
                </td>
                <td className="py-2 pl-1 text-right font-mono">{row.nrr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
