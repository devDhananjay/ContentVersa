"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Phone, Search, Shield } from "lucide-react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  type Country,
} from "@/lib/data/countries";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

type Step = "phone" | "otp";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where to redirect after a successful sign-in. */
  next?: string;
}

export function PhoneOtpDialog({ open, onOpenChange, next = "/dashboard" }: Props) {
  const router = useRouter();

  const [country, setCountry] = React.useState<Country>(DEFAULT_COUNTRY);
  const [countryOpen, setCountryOpen] = React.useState(false);
  const [countryQuery, setCountryQuery] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");

  const [step, setStep] = React.useState<Step>("phone");
  const [sending, setSending] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendIn, setResendIn] = React.useState(0);

  const recaptchaHostRef = React.useRef<HTMLDivElement>(null);
  const verifierRef = React.useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = React.useRef<ConfirmationResult | null>(null);

  // Reset state every time the dialog opens.
  React.useEffect(() => {
    if (!open) return;
    setStep("phone");
    setPhone("");
    setOtp("");
    setError(null);
    setResendIn(0);
    setCountryOpen(false);
    setCountryQuery("");
  }, [open]);

  // Tear down the reCAPTCHA verifier whenever the dialog closes — Firebase
  // throws if you try to reuse a destroyed widget on next open.
  React.useEffect(() => {
    if (open) return;
    try {
      verifierRef.current?.clear();
    } catch {
      /* ignore */
    }
    verifierRef.current = null;
    confirmationRef.current = null;
  }, [open]);

  // Simple resend cooldown.
  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const filteredCountries = React.useMemo(() => {
    if (!countryQuery) return COUNTRIES;
    const q = countryQuery.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countryQuery]);

  const fullPhone = `+${country.dial}${phone.replace(/\D/g, "")}`;

  async function ensureRecaptcha() {
    if (verifierRef.current) return verifierRef.current;
    const auth = getFirebaseAuth();
    if (!recaptchaHostRef.current) {
      throw new Error("reCAPTCHA container not mounted.");
    }
    const verifier = new RecaptchaVerifier(auth, recaptchaHostRef.current, {
      size: "invisible",
      callback: () => {
        /* token received — handled inline by signInWithPhoneNumber */
      },
      "expired-callback": () => {
        verifierRef.current = null;
      },
    });
    await verifier.render();
    verifierRef.current = verifier;
    return verifier;
  }

  async function sendOtp() {
    setError(null);

    if (!isFirebaseConfigured()) {
      setError(
        "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* in .env and restart."
      );
      return;
    }
    if (phone.replace(/\D/g, "").length < 6) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSending(true);
    try {
      const auth = getFirebaseAuth();
      const verifier = await ensureRecaptcha();
      confirmationRef.current = await signInWithPhoneNumber(
        auth,
        fullPhone,
        verifier
      );
      setStep("otp");
      setResendIn(30);
    } catch (err) {
      console.error("[phone-otp] sendOtp failed", err);
      setError(humanizeFirebaseError(err));
      // The verifier is single-use once signInWithPhoneNumber is attempted.
      try {
        verifierRef.current?.clear();
      } catch {
        /* ignore */
      }
      verifierRef.current = null;
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp() {
    setError(null);
    if (!confirmationRef.current) {
      setError("OTP session expired. Please request a new code.");
      setStep("phone");
      return;
    }
    if (otp.replace(/\D/g, "").length !== 6) {
      setError("Enter the 6-digit code from your SMS.");
      return;
    }

    setVerifying(true);
    try {
      const result = await confirmationRef.current.confirm(otp);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Sign-in failed on the server.");
      }

      onOpenChange(false);
      router.push(next);
      router.refresh();
    } catch (err) {
      console.error("[phone-otp] verifyOtp failed", err);
      setError(humanizeFirebaseError(err));
    } finally {
      setVerifying(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink flex items-center justify-center text-white">
            {step === "phone" ? (
              <Phone className="h-5 w-5" />
            ) : (
              <Shield className="h-5 w-5" />
            )}
          </div>
          <DialogTitle className="text-center font-display">
            {step === "phone" ? "Sign in with phone" : "Enter the OTP"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "phone"
              ? "We'll send you a 6-digit code via SMS — standard rates apply."
              : `Sent to ${fullPhone}. The code expires in a few minutes.`}
          </DialogDescription>
        </DialogHeader>

        {step === "phone" && (
          <div className="space-y-3">
            <Label htmlFor="phone-input">Phone number</Label>
            <div className="relative flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => setCountryOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-3 text-sm hover:bg-muted"
                aria-expanded={countryOpen}
              >
                <span className="text-base leading-none">{country.emoji}</span>
                <span className="font-medium">+{country.dial}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              <Input
                id="phone-input"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1"
              />
            </div>

            {countryOpen && (
              <div className="rounded-xl border bg-popover shadow-lg overflow-hidden">
                <div className="flex items-center gap-2 border-b px-3">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    autoFocus
                    placeholder="Search country or code…"
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="max-h-56 overflow-auto">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCountry(c);
                        setCountryOpen(false);
                        setCountryQuery("");
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted",
                        c.code === country.code && "bg-muted/60"
                      )}
                    >
                      <span className="text-base">{c.emoji}</span>
                      <span className="flex-1">{c.name}</span>
                      <span className="text-muted-foreground">+{c.dial}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                      No country matches “{countryQuery}”.
                    </p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-destructive p-2 rounded-md bg-destructive/10">
                {error}
              </p>
            )}

            <Button
              type="button"
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={sendOtp}
              disabled={sending}
            >
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-3">
            <Label htmlFor="otp-input">6-digit code</Label>
            <Input
              id="otp-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-2xl tracking-[0.4em] font-display font-bold"
            />

            {error && (
              <p className="text-xs text-destructive p-2 rounded-md bg-destructive/10">
                {error}
              </p>
            )}

            <Button
              type="button"
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={verifyOtp}
              disabled={verifying || otp.length !== 6}
            >
              {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify & sign in
            </Button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Edit number
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resendIn === 0) sendOtp();
                }}
                disabled={resendIn > 0 || sending}
                className={cn(
                  "font-medium",
                  resendIn > 0
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-foreground hover:underline"
                )}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        {/*
          Firebase's RecaptchaVerifier mounts its (invisible) widget into this
          host. It must remain in the DOM for the duration of the flow.
        */}
        <div ref={recaptchaHostRef} id="recaptcha-container" />
      </DialogContent>
    </Dialog>
  );
}

function humanizeFirebaseError(err: unknown): string {
  const code =
    (err as { code?: string })?.code || (err as Error)?.message || "";
  const map: Record<string, string> = {
    "auth/invalid-phone-number": "That phone number doesn't look right.",
    "auth/missing-phone-number": "Please enter a phone number.",
    "auth/quota-exceeded": "Too many requests right now — please try later.",
    "auth/too-many-requests": "Too many attempts. Wait a bit and try again.",
    "auth/invalid-verification-code": "Wrong code. Please try again.",
    "auth/code-expired": "This code expired. Request a new one.",
    "auth/captcha-check-failed": "reCAPTCHA failed — refresh the page.",
    "auth/operation-not-allowed":
      "Phone sign-in is not enabled in Firebase Console.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return (
    map[code] ||
    (err instanceof Error ? err.message : "Something went wrong. Please retry.")
  );
}
