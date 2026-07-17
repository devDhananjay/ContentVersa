"use client";

import * as React from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function HuidQuotaContactDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(json.error || "Could not send");
        return;
      }
      toast.success("Request sent! We'll contact you about HUID API access.");
      onOpenChange(false);
      form.reset();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-amber-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-amber-400" />
            Purchase HUID API access
          </DialogTitle>
          <DialogDescription>
            Your free 5 HUID checks are used. Contact us for jeweller / business API
            plans with higher limits.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="huid-contact-name">Name</Label>
              <Input id="huid-contact-name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="huid-contact-email">Email</Label>
              <Input id="huid-contact-email" name="email" type="email" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="huid-contact-subject">Subject</Label>
            <Input
              id="huid-contact-subject"
              name="subject"
              defaultValue="HUID API Access — GoldVerse"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="huid-contact-message">Message</Label>
            <Textarea
              id="huid-contact-message"
              name="message"
              rows={4}
              required
              defaultValue="Hi, I've used my 3 free HUID verifications. I'd like to discuss API access for my jewellery business. Please share pricing and integration options."
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full gap-2 bg-amber-500 text-black hover:bg-amber-400"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
