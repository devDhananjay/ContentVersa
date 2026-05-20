"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/admin/password-field";

export function ChangeUserPassword({
  userId,
  userEmail,
  hasPassword,
}: {
  userId: string;
  userEmail: string;
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const generatePassword = () => {
    const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
    let p = "";
    for (let i = 0; i < 12; i++) {
      p += chars[Math.floor(Math.random() * chars.length)];
    }
    setPassword(p);
    setConfirm(p);
    setSuccess(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setSuccess(data.message || "Password updated successfully.");
      setPassword("");
      setConfirm("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound className="h-5 w-5 text-orange-500" />
        <h2 className="font-display text-lg font-bold">Change password</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {hasPassword
          ? `Set a new login password for ${userEmail}. Stored passwords cannot be viewed — only reset.`
          : `This user signed in with Google only. Set a password so they can also log in with email.`}
      </p>

      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={generatePassword}>
            Generate random password
          </Button>
          {password && (
            <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={copyPassword}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy password"}
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <PasswordField
            id="new-password"
            value={password}
            onChange={setPassword}
            placeholder="Enter new password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <PasswordField
            id="confirm-password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Confirm new password"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 dark:text-green-400 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
            {success}
          </p>
        )}

        <Button type="submit" variant="gradient" className="gap-2" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          Update password
        </Button>
      </form>
    </div>
  );
}
