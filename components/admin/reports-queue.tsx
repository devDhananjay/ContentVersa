"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Flag, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { timeAgo } from "@/lib/utils";
import type { AdminReportRow } from "@/lib/data/admin-reports";

type ReportCounts = { pending: number; resolved: number; total: number };

const ACTIONS_BY_TARGET: Record<
  AdminReportRow["targetType"],
  { value: string; label: string }[]
> = {
  BLOG: [{ value: "ARCHIVE_BLOG", label: "Archive blog" }],
  COMMENT: [{ value: "HIDE_COMMENT", label: "Hide comment" }],
  USER: [
    { value: "WARN_USER", label: "Issue warning" },
    { value: "BAN_USER", label: "Ban user" },
  ],
  REEL: [{ value: "REJECT_REEL", label: "Reject reel" }],
};

function statusVariant(
  status: string
): "destructive" | "warning" | "secondary" | "success" {
  if (status === "Pending") return "warning";
  if (status === "Action taken") return "success";
  return "secondary";
}

export function ReportsQueue({
  initialReports,
  initialCounts,
  initialTab = "PENDING",
}: {
  initialReports: AdminReportRow[];
  initialCounts: ReportCounts;
  initialTab?: "PENDING" | "RESOLVED" | "ALL";
}) {
  const router = useRouter();
  const [tab, setTab] = React.useState(initialTab);
  const [reports, setReports] = React.useState(initialReports);
  const [counts, setCounts] = React.useState(initialCounts);
  const [loading, setLoading] = React.useState(false);
  const [activeReport, setActiveReport] = React.useState<AdminReportRow | null>(null);
  const [action, setAction] = React.useState("");
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState<string | null>(null);

  const loadReports = React.useCallback(async (nextTab: typeof tab) => {
    setLoading(true);
    try {
      const status =
        nextTab === "RESOLVED" ? "ALL" : nextTab === "ALL" ? "ALL" : "PENDING";
      const res = await fetch(`/api/admin/reports?status=${status}`, {
        credentials: "include",
      });
      const data = (await res.json()) as {
        reports?: AdminReportRow[];
        counts?: ReportCounts;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Failed to load");
      let rows = data.reports ?? [];
      if (nextTab === "RESOLVED") {
        rows = rows.filter((r) => r.statusCode !== "PENDING");
      }
      setReports(rows);
      if (data.counts) setCounts(data.counts);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadReports(tab);
  }, [tab, loadReports]);

  const openAction = (report: AdminReportRow) => {
    setActiveReport(report);
    const options = ACTIONS_BY_TARGET[report.targetType];
    setAction(options[0]?.value ?? "DISMISS");
    setNote("");
  };

  const runAction = async (
    report: AdminReportRow,
    chosenAction: string,
    actionNote?: string
  ) => {
    setSubmitting(report.id);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: chosenAction, note: actionNote }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Action failed");
      toast.success(
        chosenAction === "DISMISS" ? "Report dismissed" : "Action completed"
      );
      setActiveReport(null);
      router.refresh();
      await loadReports(tab);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setSubmitting(null);
    }
  };

  const dismiss = (report: AdminReportRow) => runAction(report, "DISMISS");

  return (
    <>
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="PENDING">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="RESOLVED">Resolved ({counts.resolved})</TabsTrigger>
          <TabsTrigger value="ALL">All ({counts.total})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          <div className="rounded-2xl border bg-card overflow-hidden">
            {loading && reports.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                Loading reports…
              </div>
            ) : reports.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Flag className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No reports in this queue</p>
                <p className="text-sm mt-1">
                  Users can report blogs, comments, profiles, and reels from the site.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground bg-muted/40">
                    <tr>
                      <th className="p-4">Reporter</th>
                      <th className="p-4">Target</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-t border-border/40 text-sm align-top">
                        <td className="p-4">
                          <Link
                            href={`/admin/users/${r.reporter.id}`}
                            className="hover:underline"
                          >
                            @{r.reporter.username}
                          </Link>
                        </td>
                        <td className="p-4">
                          <p className="font-mono text-xs">{r.targetLabel}</p>
                          {r.preview && (
                            <p className="text-muted-foreground text-xs mt-1 line-clamp-2 max-w-xs">
                              {r.preview}
                            </p>
                          )}
                          {r.details && (
                            <p className="text-xs mt-1 italic text-muted-foreground line-clamp-2 max-w-xs">
                              “{r.details}”
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant="destructive">{r.reason}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                          {r.actionNote && r.statusCode !== "PENDING" && (
                            <p className="text-xs text-muted-foreground mt-1 max-w-[140px] line-clamp-2">
                              {r.actionNote}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">
                          {timeAgo(r.createdAt)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <Link href={r.inspectUrl}>
                              <Button size="sm" variant="outline" className="gap-1.5">
                                <Eye className="h-3.5 w-3.5" /> Inspect
                              </Button>
                            </Link>
                            {r.statusCode === "PENDING" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="gap-1.5"
                                  disabled={submitting === r.id}
                                  onClick={() => dismiss(r)}
                                >
                                  {submitting === r.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5" />
                                  )}
                                  Dismiss
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1.5"
                                  disabled={submitting === r.id}
                                  onClick={() => openAction(r)}
                                >
                                  <Flag className="h-3.5 w-3.5" /> Take action
                                </Button>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground px-2">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!activeReport} onOpenChange={(open) => !open && setActiveReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take action on report</DialogTitle>
            <DialogDescription>
              {activeReport?.targetLabel} — reported for {activeReport?.reason}
            </DialogDescription>
          </DialogHeader>
          {activeReport && (
            <div className="space-y-4 py-2">
              {activeReport.preview && (
                <p className="text-sm text-muted-foreground border-l-2 pl-3 border-orange-500">
                  {activeReport.preview}
                </p>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Action
                </label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS_BY_TARGET[activeReport.targetType].map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Note (optional)
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Internal note or message context…"
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setActiveReport(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!activeReport || submitting === activeReport?.id}
              onClick={() => activeReport && runAction(activeReport, action, note)}
            >
              {submitting === activeReport?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
