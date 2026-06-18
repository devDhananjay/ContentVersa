"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  categorySlug: string;
  categoryName: string;
  className?: string;
};

export function CategorySubscribeButton({
  categorySlug,
  categoryName,
  className,
}: Props) {
  const router = useRouter();
  const [subscribed, setSubscribed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [signedIn, setSignedIn] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/categories/${encodeURIComponent(categorySlug)}/subscribe`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data: { subscribed?: boolean; signedIn?: boolean }) => {
        if (typeof data.subscribed === "boolean") setSubscribed(data.subscribed);
        if (data.signedIn === false) setSignedIn(false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categorySlug]);

  const toggle = async () => {
    if (!signedIn) {
      router.push(`/auth/sign-in?next=/category/${encodeURIComponent(categorySlug)}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        `/api/categories/${encodeURIComponent(categorySlug)}/subscribe`,
        { method: subscribed ? "DELETE" : "POST", credentials: "include" }
      );
      if (res.status === 401) {
        router.push(`/auth/sign-in?next=/category/${encodeURIComponent(categorySlug)}`);
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as { subscribed?: boolean };
        if (typeof data.subscribed === "boolean") setSubscribed(data.subscribed);
        else setSubscribed(!subscribed);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant={subscribed ? "outline" : "gradient"}
      className={`gap-2 ${className ?? ""}`}
      disabled={loading || busy}
      onClick={toggle}
      title={
        subscribed
          ? `Unfollow ${categoryName} — stop new-post alerts`
          : `Follow ${categoryName} — get notified on new posts`
      }
    >
      {busy || loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : subscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Follow category
        </>
      )}
    </Button>
  );
}
