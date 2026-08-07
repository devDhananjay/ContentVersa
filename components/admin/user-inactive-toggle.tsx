"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function UserInactiveToggle({
  userId,
  userEmail,
  banned,
  banReason,
  compact = false,
}: {
  userId: string;
  userEmail: string;
  banned: boolean;
  banReason?: string | null;
  /** Table row quick action — no reason field */
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [reason, setReason] = React.useState(banReason || "");
  const [error, setError] = React.useState<string | null>(null);

  const toggle = async (nextBanned: boolean) => {
    const action = nextBanned ? "deactivate" : "reactivate";
    if (
      !confirm(
        nextBanned
          ? `Deactivate ${userEmail}? They will not be able to sign in until reactivated.`
          : `Reactivate ${userEmail}? They will be able to sign in again.`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banned: nextBanned,
          banReason: nextBanned ? reason.trim() || undefined : null,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || `Failed to ${action}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <Button
        type="button"
        variant={banned ? "outline" : "destructive"}
        size="sm"
        className="gap-1"
        disabled={loading}
        onClick={() => toggle(!banned)}
        title={banned ? "Reactivate account" : "Deactivate account"}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : banned ? (
          <UserCheck className="h-3.5 w-3.5" />
        ) : (
          <UserX className="h-3.5 w-3.5" />
        )}
        {banned ? "Activate" : "Inactive"}
      </Button>
    );
  }

  return (
    <div
      className={
        banned
          ? "mt-8 rounded-2xl border border-destructive/40 bg-destructive/5 p-6"
          : "mt-8 rounded-2xl border bg-card p-6"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            {banned ? (
              <>
                <UserX className="h-5 w-5 text-destructive" /> Account inactive
              </>
            ) : (
              <>
                <UserCheck className="h-5 w-5 text-emerald-500" /> Account active
              </>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            {banned
              ? "This user cannot sign in. Reactivate to restore access."
              : "Deactivate to block sign-in without deleting their content or account."}
          </p>
          {banned && banReason ? (
            <p className="text-sm mt-2">
              <span className="text-muted-foreground">Reason:</span> {banReason}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant={banned ? "default" : "destructive"}
          className="gap-1.5"
          disabled={loading}
          onClick={() => toggle(!banned)}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {banned ? "Reactivate user" : "Mark inactive"}
        </Button>
      </div>

      {!banned ? (
        <div className="mt-4 space-y-2 max-w-md">
          <Label htmlFor={`ban-reason-${userId}`}>Reason (optional)</Label>
          <Input
            id={`ban-reason-${userId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Policy violation, spam, user request…"
            maxLength={300}
          />
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
    </div>
  );
}
