"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Coffee, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

const TIP_AMOUNTS_INR = [99, 199, 499] as const;

export function TipCreator({
  blogSlug,
  authorName,
  authorAvatar,
}: {
  blogSlug: string;
  authorName: string;
  authorAvatar: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);

  const sendTip = async (amount: number) => {
    setBusy(true);
    setSelected(amount);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(blogSlug)}/tip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (res.status === 401) {
        router.push(`/auth/sign-in?next=/blog/${blogSlug}`);
        return;
      }
      if (!res.ok) {
        toast.error(data.error || "Could not send tip");
        return;
      }
      toast.success(`₹${amount} tip sent to ${authorName.split(" ")[0]}!`);
    } finally {
      setBusy(false);
      setSelected(null);
    }
  };

  return (
    <div className="rounded-3xl border-gradient bg-card p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
        <Avatar className="h-16 w-16 border-2 border-border shrink-0">
          <AvatarImage src={authorAvatar} alt={authorName} />
          <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-1">
            Liked this piece?
          </p>
          <h3 className="font-display text-2xl font-bold">
            Tip {authorName.split(" ")[0]} for the work
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            100% goes to the creator. Send a one-time tip in rupees and back the writing you love.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {TIP_AMOUNTS_INR.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => sendTip(amount)}
            >
              {busy && selected === amount ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `₹${amount}`
              )}
            </Button>
          ))}
          <Button
            type="button"
            variant="gradient"
            className="gap-2"
            disabled={busy}
            onClick={() => sendTip(199)}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Coffee className="h-4 w-4" /> Tip ₹199
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
