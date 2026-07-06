"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HuidQuotaContactDialog } from "./huid-quota-contact-dialog";
import type { HuidQuotaStatus, HuidRecord } from "@/lib/jewellers/types";

const FIELD_LABELS: Record<keyof HuidRecord, string> = {
  huid: "HUID",
  purity: "Purity",
  articleType: "Article",
  material: "Material",
  jewellerName: "Jeweller",
  jewellerRegNo: "Jeweller reg. no.",
  jewellerAddress: "Address",
  hallmarkCentre: "Hallmark centre",
  ahcRegNo: "AHC reg. no.",
  pincode: "Pincode",
  dateOfMarking: "Date of marking",
  status: "Status",
  weight: "Weight",
};

export function HuidVerifyPanel({
  signInNext = "/jewellers#huid-verify",
}: {
  signInNext?: string;
}) {
  const [huid, setHuid] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [quota, setQuota] = React.useState<HuidQuotaStatus | null>(null);
  const [result, setResult] = React.useState<{
    ok: boolean;
    message?: string;
    data?: HuidRecord;
  } | null>(null);
  const [contactOpen, setContactOpen] = React.useState(false);

  const loadQuota = React.useCallback(() => {
    fetch("/api/jewellers/huid/quota")
      .then((r) => r.json())
      .then((d: HuidQuotaStatus) => setQuota(d))
      .catch(() => setQuota(null));
  }, []);

  React.useEffect(() => {
    loadQuota();
  }, [loadQuota]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = huid.trim().toUpperCase();
    if (trimmed.length !== 6) {
      toast.error("HUID must be 6 characters");
      return;
    }

    if (!quota?.loggedIn) {
      toast.error("Sign in to verify HUID");
      return;
    }

    if (!quota.canVerify) {
      setContactOpen(true);
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/jewellers/huid/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ huid: trimmed }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        data?: HuidRecord;
        error?: string;
        quota?: { remaining: number; used: number; limit: number };
      };

      if (res.status === 401) {
        toast.error("Please sign in to verify HUID");
        return;
      }

      if (res.status === 429 || data.error === "quota_exceeded") {
        setContactOpen(true);
        loadQuota();
        return;
      }

      setResult({
        ok: !!data.ok,
        message: data.message,
        data: data.data,
      });

      if (data.quota) {
        setQuota((prev) =>
          prev
            ? {
                ...prev,
                used: data.quota!.used,
                remaining: data.quota!.remaining,
                limit: data.quota!.limit,
                canVerify: data.quota!.remaining > 0,
              }
            : prev
        );
      } else {
        loadQuota();
      }

      if (!data.ok) toast.error(data.message || "Verification failed");
      else toast.success("HUID verified via BIS");
    } catch {
      toast.error("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section
        id="huid-verify"
        className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-card to-card p-6 md:p-8 shadow-lg shadow-amber-950/20"
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <ShieldCheck className="h-4 w-4" />
                HUID verification
              </p>
              <h2 className="mt-2 font-display text-xl font-bold md:text-2xl">
                Verify hallmark unique ID
              </h2>
              <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                Official BIS database check — 6-character code on your gold jewellery.
                Sign in required.{" "}
                <strong className="text-foreground">5 free checks</strong> per account.
              </p>
            </div>
            {quota?.loggedIn ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Checks left</p>
                <p className="font-display text-2xl font-bold text-amber-300">
                  {quota.remaining}
                  <span className="text-sm text-muted-foreground">/{quota.limit}</span>
                </p>
              </div>
            ) : null}
          </div>

          {!quota?.loggedIn ? (
            <div className="mt-5 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-5 text-center">
              <p className="text-sm text-muted-foreground">
                Sign in to verify HUID and track your free checks.
              </p>
              <Link href={`/auth/sign-in?next=${encodeURIComponent(signInNext)}`}>
                <Button className="mt-3 bg-amber-500 text-black hover:bg-amber-400">
                  Sign in to verify
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Input
                value={huid}
                onChange={(e) =>
                  setHuid(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))
                }
                placeholder="e.g. A1B2C3"
                maxLength={6}
                className="h-12 font-mono text-lg tracking-[0.3em] uppercase"
                autoComplete="off"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || huid.length < 6}
                className="h-12 shrink-0 gap-2 bg-amber-500 px-8 text-black hover:bg-amber-400"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Verify HUID
              </Button>
            </form>
          )}

          {quota?.loggedIn && !quota.canVerify ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <span className="text-muted-foreground">
                Free limit reached. Purchase API access for your shop or business.
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-amber-500/40"
                onClick={() => setContactOpen(true)}
              >
                Contact us
              </Button>
            </div>
          ) : null}

          {result ? (
            <div
              className={`mt-6 rounded-xl border p-4 ${
                result.ok
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-red-500/40 bg-red-500/10"
              }`}
            >
              <div className="flex items-center gap-2">
                {result.ok ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <p className="font-semibold">
                  {result.ok ? "Genuine BIS hallmark record" : "Not verified"}
                </p>
              </div>
              {result.message ? (
                <p className="mt-2 text-sm text-muted-foreground">{result.message}</p>
              ) : null}
              {result.ok && result.data ? (
                <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(Object.entries(result.data) as [keyof HuidRecord, string | undefined][])
                    .filter(([, v]) => v)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-lg border border-border/40 bg-card/50 px-3 py-2"
                      >
                        <dt className="text-[10px] uppercase text-muted-foreground">
                          {FIELD_LABELS[key]}
                        </dt>
                        <dd className="text-sm font-medium">{value}</dd>
                      </div>
                    ))}
                </dl>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <HuidQuotaContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
