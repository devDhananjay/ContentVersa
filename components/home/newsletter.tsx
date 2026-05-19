"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };
  return (
    <section className="container py-12 md:py-20">
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-neon-blue/10 via-neon-purple/10 to-neon-pink/10 p-8 md:p-16 text-center">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-neon-pink/20 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 backdrop-blur border border-border/40 text-xs mb-6">
            <Sparkles className="h-3 w-3 text-neon-cyan" />
            <span className="text-foreground/80">The Verse · Weekly</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">
            The best of <span className="text-gradient">ContentVerse</span>,
            <br /> straight to your inbox.
          </h2>
          <p className="mt-4 text-muted-foreground">
            One newsletter every Friday. The top 5 reads, 1 creator spotlight, and where the next wave is forming. 0 spam, ever.
          </p>

          {submitted ? (
            <div className="mt-8 flex items-center justify-center gap-2 text-neon-green">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">You&apos;re in. Welcome to The Verse.</span>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="you@yourbrand.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-12 rounded-xl bg-background/80 backdrop-blur"
                />
              </div>
              <Button variant="gradient" size="lg" type="submit">
                Subscribe
              </Button>
            </form>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            Join 42,300+ creators & readers · Unsubscribe anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
