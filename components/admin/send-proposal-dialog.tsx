"use client";

import * as React from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blogId: string;
  blogTitle: string;
  authorName: string;
  authorEmail?: string | null;
  authorUsername?: string;
  onSent?: (info: { to: string; from?: string; authorName?: string | null }) => void;
};

export function SendProposalDialog({
  open,
  onOpenChange,
  blogId,
  blogTitle,
  authorName,
  authorEmail,
  authorUsername,
  onSent,
}: Props) {
  const [sending, setSending] = React.useState(false);

  const send = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/admin/send-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to send proposal");
      toast.success(
        data.to
          ? `Proposal sent to ${data.authorName || authorName} <${data.to}>`
          : "Proposal email sent"
      );
      onSent?.({
        to: data.to,
        from: data.from,
        authorName: data.authorName,
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send proposal");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-orange-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
              <Send className="h-4 w-4" />
            </span>
            Send sponsored proposal
          </DialogTitle>
          <DialogDescription>
            Email a paid publishing pitch to the author. This does not approve or reject the
            post.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-muted/40 p-4 space-y-3">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Recipient
              </p>
              <p className="font-semibold mt-0.5">{authorName}</p>
              <p className="text-sm text-muted-foreground">
                {authorEmail || "Account email on file"}
                {authorUsername ? ` · @${authorUsername}` : ""}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Blog
              </p>
              <p className="text-sm font-medium mt-0.5 line-clamp-2">{blogTitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Mail className="h-3 w-3" /> From writewith@contentverses.in
              </Badge>
              <Badge variant="outline">Status unchanged</Badge>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground text-xs uppercase tracking-widest">
              Email preview
            </p>
            <p className="font-medium text-foreground">
              Subject: Sponsored Content Publishing Opportunity – ContentVerse
            </p>
            <p className="leading-relaxed">
              Thanks for interest in publishing on ContentVerse. We offer paid sponsored
              article / brand promotion packages — not free promo placements. Reply to get
              pricing.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            disabled={sending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            className="gap-1.5"
            disabled={sending}
            onClick={send}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? "Sending…" : "Send proposal email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
