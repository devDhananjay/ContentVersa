"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clapperboard, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CineverseNewsletter() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ottDigest: true }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Subscribe failed");
        return;
      }
      setDone(true);
      toast.success("CineVerse OTT digest — you're in!");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/40 via-card to-card p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
          <Clapperboard className="h-3.5 w-3.5" />
          OTT weekly
        </p>
        <h2 className="mt-2 font-display text-xl font-bold md:text-2xl">
          This week on OTT & theatres
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Friday email with trending films, India release dates, and CineVerse picks — opt in only.
        </p>

        {done ? (
          <div className="mt-5 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Subscribed to OTT digest</span>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 flex max-w-md flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="pl-9"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Subscribe
            </Button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
