"use client";

import * as React from "react";
import { BellRing, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase";
import { registerFirebasePushToken } from "@/lib/firebase-messaging";
import { useSession } from "@/components/auth/use-session";

export function EnablePushButton({ onEnabled }: { onEnabled?: () => void }) {
  const { user } = useSession();
  const [status, setStatus] = React.useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  if (!user || !isFirebaseConfigured()) return null;
  if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) return null;

  const enable = async () => {
    setStatus("loading");
    setMessage(null);
    const result = await registerFirebasePushToken();
    if (result.token) {
      setStatus("ok");
      setMessage("Browser notifications enabled. ContentVerse will appear in Safari → Websites → Notifications.");
      onEnabled?.();
    } else {
      setStatus("err");
      setMessage(result.error ?? "Could not enable notifications.");
    }
  };

  return (
    <div className="rounded-2xl border border-neon-purple/30 bg-neon-purple/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold flex items-center gap-2">
          <BellRing className="h-4 w-4 text-neon-purple" />
          Browser notifications
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Tap the button below — Safari will ask for permission. Then contentverse.co.in will show in
          your notification settings.
        </p>
        {message && (
          <p
            className={`text-xs mt-2 ${status === "ok" ? "text-green-600" : "text-destructive"}`}
          >
            {message}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="gradient"
        size="sm"
        className="shrink-0 gap-1.5"
        disabled={status === "loading" || status === "ok"}
        onClick={enable}
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "ok" ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <BellRing className="h-4 w-4" />
        )}
        {status === "ok" ? "Enabled" : "Enable notifications"}
      </Button>
    </div>
  );
}
