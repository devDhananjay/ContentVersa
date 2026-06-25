"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPORT_REASON_LABELS, REPORT_REASONS } from "@/lib/reports/constants";

export function ReportContentButton({
  targetType,
  targetId,
  label = "Report",
}: {
  targetType: "BLOG" | "COMMENT" | "USER" | "REEL";
  targetId: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<string>("SPAM");
  const [details, setDetails] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details: details.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.status === 401) {
        toast.error("Sign in to report content");
        router.push("/auth/sign-in");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Could not submit report");
      toast.success("Report submitted. Our team will review it.");
      setOpen(false);
      setDetails("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Report failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Flag className="h-3.5 w-3.5" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report content</DialogTitle>
          <DialogDescription>
            Tell us what is wrong. Reports are reviewed by moderators.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Reason
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((code) => (
                  <SelectItem key={code} value={code}>
                    {REPORT_REASON_LABELS[code]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Details (optional)
            </label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add context for moderators…"
              className="min-h-[90px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={loading} onClick={submit}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
