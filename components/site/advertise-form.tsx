"use client";

import * as React from "react";
import { Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AD_TYPES = [
  { value: "display-banner", label: "Display banner (horizontal / MREC)" },
  { value: "sidebar-rail", label: "Sidebar / skyscraper" },
  { value: "sponsored-article", label: "Sponsored article / native story" },
  { value: "homepage", label: "Homepage sponsorship" },
  { value: "hub-sponsor", label: "Hub sponsorship (Sports, Tools, Finance…)" },
  { value: "newsletter", label: "Newsletter / email mention" },
  { value: "other", label: "Other / package discussion" },
] as const;

const BUDGETS = [
  { value: "", label: "Prefer not to say" },
  { value: "under-25k", label: "Under ₹25,000" },
  { value: "25k-1L", label: "₹25,000 – ₹1 lakh" },
  { value: "1L-5L", label: "₹1 lakh – ₹5 lakh" },
  { value: "5L-plus", label: "₹5 lakh+" },
  { value: "monthly-retainer", label: "Monthly retainer" },
] as const;

export function AdvertiseForm() {
  const [busy, setBusy] = React.useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/advertise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone") || "",
          company: data.get("company"),
          website: data.get("website") || "",
          adType: data.get("adType"),
          budget: data.get("budget") || "",
          placements: data.get("placements") || "",
          message: data.get("message"),
        }),
      });
      const json = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        toast.error(json.error || "Could not send request");
        return;
      }
      toast.success("Request sent! Our ads team will reply on email.");
      form.reset();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border bg-card p-6 md:p-8"
    >
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold">Advertise with us</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your brand and preferred format. We usually reply within
          1–2 business days.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="adv-name">Your name</Label>
          <Input id="adv-name" name="name" required placeholder="Full name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="adv-email">Work email</Label>
          <Input
            id="adv-email"
            name="email"
            type="email"
            required
            placeholder="you@brand.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="adv-company">Company / brand</Label>
          <Input
            id="adv-company"
            name="company"
            required
            placeholder="Brand or agency name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="adv-phone">Phone (optional)</Label>
          <Input
            id="adv-phone"
            name="phone"
            type="tel"
            placeholder="+91 …"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="adv-website">Website (optional)</Label>
        <Input
          id="adv-website"
          name="website"
          type="url"
          placeholder="https://"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="adv-type">Ad format</Label>
          <select
            id="adv-type"
            name="adType"
            required
            defaultValue=""
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="" disabled>
              Select a format
            </option>
            {AD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="adv-budget">Approx. budget</Label>
          <select
            id="adv-budget"
            name="budget"
            defaultValue=""
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {BUDGETS.map((b) => (
              <option key={b.value || "na"} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="adv-placements">Preferred pages / hubs (optional)</Label>
        <Input
          id="adv-placements"
          name="placements"
          placeholder="e.g. Homepage, Sports, India Tools, Finance blogs"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="adv-message">Campaign brief</Label>
        <Textarea
          id="adv-message"
          name="message"
          required
          rows={6}
          placeholder="Goals, target audience in India, dates, creative links, or any questions…"
        />
      </div>

      <Button type="submit" variant="gradient" className="gap-2" disabled={busy}>
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Megaphone className="h-4 w-4" />
        )}
        Submit advertising request
      </Button>
    </form>
  );
}
