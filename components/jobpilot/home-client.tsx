"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSession } from "@/components/auth/use-session";

export function JobPilotHomeClient() {
  const { user, loading } = useSession();
  const [resumeInfo, setResumeInfo] = React.useState<{
    fileName: string | null;
    textLength: number;
    preview: string;
  } | null>(null);
  const [usage, setUsage] = React.useState<{
    analysisRemaining: number;
    coverLetterRemaining: number;
    analysisLimit: number;
    coverLetterLimit: number;
  } | null>(null);
  const [text, setText] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    if (!user) return;
    const [meRes, resumeRes] = await Promise.all([
      fetch("/api/jobpilot/me", { credentials: "include" }),
      fetch("/api/jobpilot/resume", { credentials: "include" }),
    ]);
    if (meRes.ok) {
      const me = await meRes.json();
      setUsage(me.usage);
    }
    if (resumeRes.ok) {
      const data = await resumeRes.json();
      if (data.resume) {
        setResumeInfo({
          fileName: data.resume.fileName,
          textLength: data.resume.textLength,
          preview: data.resume.preview,
        });
      }
    }
  }, [user]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const saveText = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/jobpilot/resume", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success("Resume saved");
      setText("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File) => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/jobpilot/resume", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast.success("Resume uploaded");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
        <Link href="/auth/sign-in?next=/jobpilot" className="text-emerald-600 underline">
          Sign in
        </Link>{" "}
        to upload your resume and use ContentVerse HirePilot.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {usage && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Analyses left
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {usage.analysisRemaining}
              <span className="text-sm font-normal text-muted-foreground">
                /{usage.analysisLimit}
              </span>
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Cover letters left
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {usage.coverLetterRemaining}
              <span className="text-sm font-normal text-muted-foreground">
                /{usage.coverLetterLimit}
              </span>
            </p>
          </div>
        </div>
      )}

      <section className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-bold">Your resume</h2>
        {resumeInfo ? (
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              {resumeInfo.fileName || "Resume"} · {resumeInfo.textLength} chars
            </p>
            <p className="mt-2 line-clamp-4">{resumeInfo.preview}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
        )}

        <div className="space-y-2">
          <Label>Paste resume text</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Paste your resume here…"
          />
          <Button
            onClick={() => void saveText()}
            disabled={saving || text.trim().length < 40}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save text
          </Button>
        </div>

        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadFile(f);
            }}
          />
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fileRef.current?.click()}
            disabled={saving}
          >
            <Upload className="h-4 w-4" /> Upload PDF / TXT
          </Button>
        </div>
      </section>
    </div>
  );
}
