"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialButtons } from "@/components/auth/social-buttons";
import {
  getLoginSuggestions,
  getRememberedIdentifier,
  isRememberMeEnabled,
  setRememberedIdentifier,
} from "@/lib/auth/remembered-login";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  missing_code: "Google did not return an authorization code.",
  state_mismatch: "Sign-in session expired. Please try again.",
  google_exchange_failed: "Could not exchange Google's response. Please retry.",
  no_email: "Your Google account did not return an email.",
};

export function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();
  const oauthError = search.get("error");
  const next = search.get("next") || "/dashboard";
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    oauthError ? OAUTH_ERROR_MESSAGES[oauthError] || "Sign-in failed." : null
  );

  React.useEffect(() => {
    const remembered = getRememberedIdentifier();
    if (remembered) setEmail(remembered);
    setRememberMe(isRememberMeEnabled());
    setSuggestions(getLoginSuggestions());
  }, []);

  React.useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { user: unknown }) => {
        if (data.user) router.replace(next);
      })
      .catch(() => {});
  }, [router, next]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string; role?: string };
      if (!res.ok) throw new Error(data.error || "Sign in failed");

      if (rememberMe) {
        setRememberedIdentifier(email.trim());
      } else {
        setRememberedIdentifier(null);
      }

      const adminRoles = ["MODERATOR", "ADMIN", "SUPER_ADMIN"];
      const dest =
        adminRoles.includes(data.role ?? "") && next === "/dashboard"
          ? "/admin/moderation"
          : next;
      window.location.href = dest;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Welcome back.
      </h1>
      <p className="text-muted-foreground mt-1.5">
        Sign in to continue building on ContentVerse.
      </p>

      <div className="mt-6">
        <SocialButtons next={next} />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 h-px bg-border" />
        or with email
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email or username</Label>
          <Input
            id="email"
            name="email"
            type="text"
            autoComplete="username"
            list="cv-login-suggestions"
            placeholder="you@email.com or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {suggestions.length > 0 && (
            <datalist id="cv-login-suggestions">
              {suggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-border text-neon-purple focus:ring-neon-purple/40"
          />
          <span className="text-sm text-muted-foreground">Remember me</span>
        </label>

        {error && (
          <div className="text-xs text-destructive p-2 rounded-md bg-destructive/10">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/auth/sign-up" className="font-medium text-foreground hover:underline">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
