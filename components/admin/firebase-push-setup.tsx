"use client";

import * as React from "react";
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const FIREBASE_SA_URL =
  "https://console.firebase.google.com/project/contentverse-84583/settings/serviceaccounts/adminsdk";

export function FirebasePushSetup() {
  const [json, setJson] = React.useState("");
  const [status, setStatus] = React.useState<{
    configured?: boolean;
    reason?: string;
    source?: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const loadStatus = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/firebase/credentials", {
        credentials: "include",
      });
      if (res.ok) {
        setStatus((await res.json()) as typeof status);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(json) as Record<string, unknown>;
      } catch {
        setMessage("Invalid JSON — paste the full file from Firebase.");
        return;
      }
      const res = await fetch("/api/admin/firebase/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credentials: parsed }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setMessage(data.error || "Save failed");
        return;
      }
      setMessage(data.message || "Saved.");
      setJson("");
      await loadStatus();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-neon-cyan" />
            Browser push (server)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            VAPID / client Firebase is already set. Server push needs the service
            account private key (one-time).
          </p>
        </div>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : status?.configured ? (
          <span className="text-xs font-semibold text-green-500">Configured</span>
        ) : (
          <span className="text-xs font-semibold text-amber-500">Not configured</span>
        )}
      </div>

      <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
        <li>
          Open Firebase → Service accounts →{" "}
          <strong>Generate new private key</strong>.
        </li>
        <li>Open the downloaded <code className="text-xs">.json</code> file and paste below.</li>
        <li>Save, then test from Dashboard → Notifications (Super Admin).</li>
      </ol>

      <Button variant="outline" size="sm" className="gap-2" asChild>
        <a href={FIREBASE_SA_URL} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3.5 w-3.5" />
          Open Firebase service accounts
        </a>
      </Button>

      <div className="space-y-1.5">
        <Label htmlFor="firebase-sa-json">Service account JSON</Label>
        <Textarea
          id="firebase-sa-json"
          rows={6}
          placeholder='{"type":"service_account","project_id":"contentverse-84583",...}'
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="font-mono text-xs"
        />
      </div>

      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}

      <Button
        variant="gradient"
        disabled={saving || !json.trim()}
        onClick={save}
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Saving…
          </>
        ) : (
          "Save server push credentials"
        )}
      </Button>
    </section>
  );
}
