import { Flag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const REPORTS = [
  { id: "r1", reporter: "riya", target: "blog: spam-everywhere", reason: "Spam", date: "2026-05-15" },
  { id: "r2", reporter: "jordan", target: "user: badactor99", reason: "Harassment", date: "2026-05-14" },
  { id: "r3", reporter: "maya", target: "comment: id_3924", reason: "Hate speech", date: "2026-05-13" },
];

export default function ReportsPage() {
  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          User-submitted reports on content, comments, and users.
        </p>
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground bg-muted/40">
            <tr>
              <th className="p-4">Reporter</th>
              <th className="p-4">Target</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((r) => (
              <tr key={r.id} className="border-t border-border/40 text-sm">
                <td className="p-4">@{r.reporter}</td>
                <td className="p-4 font-mono text-xs">{r.target}</td>
                <td className="p-4">
                  <Badge variant="destructive">{r.reason}</Badge>
                </td>
                <td className="p-4 text-muted-foreground">{r.date}</td>
                <td className="p-4 text-right space-x-1">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Inspect
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1.5">
                    <Flag className="h-3.5 w-3.5" /> Take action
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
