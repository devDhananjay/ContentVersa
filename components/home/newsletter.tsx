"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, CheckCircle2, Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/components/i18n/use-dictionary";

export function Newsletter() {
  const reduce = useReducedMotion();
  const { t } = useDictionary();
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        emailSent?: boolean;
      };
      if (!res.ok) {
        toast.error(data.error || "Could not subscribe. Try again.");
        return;
      }
      setSubmitted(true);
      if (data.emailSent) {
        toast.success("Check your inbox — welcome email sent!");
      } else {
        toast.success("You're subscribed! (Email delivery pending server setup)");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="container py-12 md:py-20 scroll-mt-24">
      <div className="grid gap-5 md:grid-cols-2">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="v2-surface flex flex-col justify-between p-7 md:p-8"
        >
          <div>
            <p className="v2-eyebrow">{t("home.newsletterEyebrow")}</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
              {t("home.newsletterTitle")}
            </h2>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              {[
                "A useful India guide — SIP, schemes, jobs or gold.",
                "What changed this week, in plain language.",
                "No dumps, no promo blasts. Unsubscribe anytime.",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <BookOpen className="h-3.5 w-3.5" />
                  </span>
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            Weekly digest · made for Indian readers
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="v2-raised relative overflow-hidden p-7 md:p-8"
        >
          <div className="v2-aurora opacity-70" aria-hidden />
          <div
            className="v2-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(70%_60%_at_80%_0%,#000,transparent)]"
            aria-hidden
          />
          <div className="relative">
            <p className="v2-eyebrow inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Newsletter
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {t("home.newsletterCta")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              {t("home.newsletterTitle")}
            </p>

            {submitted ? (
              <div className="mt-8 flex items-center gap-2 text-[hsl(var(--positive))]">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{t("home.newsletterThanks")}</span>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Sparkles className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    placeholder={t("home.newsletterPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-background pl-10"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="v2-btn-primary inline-flex h-12 shrink-0 items-center justify-center rounded-xl px-6 text-sm font-semibold disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("home.newsletterSubscribe")
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
