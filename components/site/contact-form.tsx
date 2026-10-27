"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useDictionary } from "@/components/i18n/use-dictionary";

export function ContactForm() {
  const { t } = useDictionary();
  const [busy, setBusy] = React.useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const json = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        toast.error(json.error || t("forms.error"));
        return;
      }
      toast.success(t("forms.success"));
      form.reset();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6 md:p-8 space-y-5">
      <h2 className="font-display text-xl font-bold">{t("forms.sendMessage")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("forms.name")}</Label>
          <Input id="name" name="name" required placeholder="Your name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("forms.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject">{t("forms.subject")}</Label>
        <Input
          id="subject"
          name="subject"
          required
          placeholder="How can we help?"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">{t("forms.message")}</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Tell us a bit more…"
        />
      </div>
      <Button type="submit" variant="gradient" className="gap-2" disabled={busy}>
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {busy ? t("forms.sending") : t("forms.submit")}
      </Button>
    </form>
  );
}
