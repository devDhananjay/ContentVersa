"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  balanceInr: number;
  minWithdraw?: number;
};

export function WithdrawButton({ balanceInr, minWithdraw = 100 }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const max = Math.floor(balanceInr);
  const canWithdraw = max >= minWithdraw;

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/me/withdraw", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/sign-in?next=/dashboard/earnings");
          return;
        }
        setError(data.error || "Withdrawal failed");
        return;
      }
      setSuccess(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        variant="gradient"
        className="gap-2"
        disabled={!canWithdraw}
        onClick={() => {
          setAmount(String(max));
          setSuccess(false);
          setError(null);
          setOpen(true);
        }}
        title={
          canWithdraw
            ? "Request payout to your registered email"
            : `Minimum withdrawal is ₹${minWithdraw}`
        }
      >
        <Wallet className="h-4 w-4" /> Withdraw
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request withdrawal</DialogTitle>
            <DialogDescription>
              Available balance: ₹{max.toLocaleString("en-IN")}. Payouts are processed manually
              within 3–5 business days to your payout email.
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <p className="text-sm text-green-600 dark:text-green-400 py-4">
              Withdrawal request submitted. You&apos;ll get a notification when it&apos;s processed.
            </p>
          ) : (
            <div className="space-y-3 py-2">
              <div>
                <Label htmlFor="withdraw-amount">Amount (INR)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  min={minWithdraw}
                  max={max}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}

          <DialogFooter>
            {success ? (
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gradient" disabled={busy} onClick={submit}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit request"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
