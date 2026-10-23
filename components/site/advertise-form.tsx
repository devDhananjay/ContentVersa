"use client";

import * as React from "react";
import { Loader2, Megaphone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAdvertisePreview } from "@/components/site/advertise-preview-context";

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

const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AdvertiseForm() {
  const [busy, setBusy] = React.useState(false);
  const { brand, website, adType, placements, setPreview } =
    useAdvertisePreview();

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
      setPreview({ brand: "", website: "", adType: "", placements: "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 overflow-hidden rounded-[1.35rem] border border-border/60 bg-card/90 shadow-[0_24px_56px_-40px_hsl(var(--primary)/0.5)]"
    >
      <div className="relative border-b border-border/50 bg-gradient-to-br from-primary/[0.12] via-background/40 to-[hsl(var(--saffron))]/[0.1] px-6 py-6 md:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--saffron))] text-white shadow-[0_10px_24px_-12px_hsl(var(--primary)/0.8)]">
            <Megaphone className="h-4 w-4" />
          </span>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Campaign brief
            </p>
            <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
              Tell us about your campaign
            </h2>
            <p className="text-sm text-muted-foreground">
              Brand, format, and goals — we usually reply within 1–2 business
              days.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-6 pb-6 md:px-8 md:pb-8">
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
              value={brand}
              onChange={(e) => setPreview({ brand: e.target.value })}
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
            value={website}
            onChange={(e) => setPreview({ website: e.target.value })}
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
              value={adType}
              onChange={(e) => setPreview({ adType: e.target.value })}
              className={selectClass}
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
              className={selectClass}
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
            value={placements}
            onChange={(e) => setPreview({ placements: e.target.value })}
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
            className="min-h-[140px] resize-y"
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-border/50 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            No spam — only campaign follow-ups on your work email.
          </p>
          <Button
            type="submit"
            variant="gradient"
            className="gap-2 sm:min-w-[220px]"
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit request
          </Button>
        </div>
      </div>
    </form>
  );
}
