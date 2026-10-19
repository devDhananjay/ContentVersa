"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function BlogModerationActions({
  blogId,
  status,
  adEligible: initialAdEligible = false,
}: {
  blogId: string;
  status: string;
  adEligible?: boolean;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = React.useState("");
  const [adEligibleOnApprove, setAdEligibleOnApprove] = React.useState(true);
  const [adEligible, setAdEligible] = React.useState(initialAdEligible);
  const [loading, setLoading] = React.useState<"approve" | "reject" | "publish" | "ads" | null>(
    null
  );

  React.useEffect(() => {
    setAdEligible(initialAdEligible);
  }, [initialAdEligible]);

  const decide = async (decision: "APPROVED" | "REJECTED") => {
    setLoading(decision === "APPROVED" ? "approve" : "reject");
    try {
      if (decision === "APPROVED") {
        toast.loading("Checking AI content & cleaning…", { id: "ai-publish" });
      }
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId,
          decision,
          feedback: feedback || undefined,
          ...(decision === "APPROVED" ? { adEligible: adEligibleOnApprove } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const hits =
          Array.isArray(data.hits) && data.hits.length
            ? ` (${data.hits.slice(0, 4).join(", ")})`
            : "";
        throw new Error((data.error || "Action failed") + hits);
      }
      if (decision === "APPROVED") {
        const ai = data.aiFree as
          | {
              markersScrubbed?: number;
              humanized?: boolean;
              expanded?: boolean;
              words?: number;
            }
          | undefined;
        const bits = [
          ai?.markersScrubbed
            ? `scrubbed ${ai.markersScrubbed} AI marker(s)`
            : "AI-free check passed",
          ai?.humanized ? "humanized" : null,
          ai?.expanded ? "expanded" : null,
          ai?.words ? `${ai.words} words` : null,
        ].filter(Boolean);
        toast.success(`Published — ${bits.join(" · ")}`, { id: "ai-publish" });
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed", {
        id: "ai-publish",
      });
    } finally {
      setLoading(null);
    }
  };

  const publishDraft = async () => {
    setLoading("publish");
    try {
      toast.loading("Checking AI content & cleaning…", { id: "ai-publish" });
      const res = await fetch(`/api/admin/blogs/${blogId}/publish`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const hits =
          Array.isArray(data.hits) && data.hits.length
            ? ` (${data.hits.slice(0, 4).join(", ")})`
            : "";
        throw new Error((data.error || "Publish failed") + hits);
      }
      const ai = data.aiFree as
        | {
            markersScrubbed?: number;
            humanized?: boolean;
            expanded?: boolean;
            words?: number;
          }
        | undefined;
      const bits = [
        ai?.markersScrubbed
          ? `scrubbed ${ai.markersScrubbed} AI marker(s)`
          : "AI-free check passed",
        ai?.humanized ? "humanized" : null,
        ai?.expanded ? "expanded" : null,
        ai?.words ? `${ai.words} words` : null,
      ].filter(Boolean);
      toast.success(`Published — ${bits.join(" · ")}`, { id: "ai-publish" });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publish failed", {
        id: "ai-publish",
      });
    } finally {
      setLoading(null);
    }
  };

  const toggleAds = async (next: boolean) => {
    setLoading("ads");
    const prev = adEligible;
    setAdEligible(next);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId, adEligible: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update ads flag");
      toast.success(next ? "Ads enabled for this post" : "Ads disabled for this post");
      router.refresh();
    } catch (err) {
      setAdEligible(prev);
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  };

  const editHref = `/admin/blogs/${blogId}/edit`;

  if (status === "PUBLISHED") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
        <h3 className="font-display font-bold">Published — edit live post</h3>
        <p className="text-sm text-muted-foreground">
          Changes save in place and stay published. Use Unpublish in the editor to take it offline.
        </p>
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-background/60 px-3 py-2">
          <div>
            <Label htmlFor={`ad-eligible-${blogId}`}>Show AdSense</Label>
            <p className="text-xs text-muted-foreground">Only for quality, indexable posts.</p>
          </div>
          <Switch
            id={`ad-eligible-${blogId}`}
            checked={adEligible}
            disabled={loading === "ads"}
            onCheckedChange={toggleAds}
          />
        </div>
        <Link href={editHref}>
          <Button variant="outline" className="gap-1.5">
            <Pencil className="h-4 w-4" /> Edit published blog
          </Button>
        </Link>
      </div>
    );
  }

  if (status === "DRAFT" || status === "REJECTED" || status === "ARCHIVED") {
    return (
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5 space-y-3">
        <h3 className="font-display font-bold">
          {status === "DRAFT" ? "Draft — review before publishing" : `${status} — edit or publish`}
        </h3>
        <p className="text-sm text-muted-foreground">
          On publish we scan for AI filler, clean it, and block go-live if it still sounds
          machine-written. Ads follow the quality gate.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={editHref}>
            <Button variant="outline" className="gap-1.5">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button
            variant="gradient"
            className="gap-1.5"
            disabled={!!loading}
            onClick={publishDraft}
          >
            {loading === "publish" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {loading === "publish" ? "Cleaning AI…" : "Publish now"}
          </Button>
        </div>
      </div>
    );
  }

  if (status !== "PENDING") return null;

  return (
    <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5 space-y-4">
      <h3 className="font-display font-bold">Moderation actions</h3>
      <p className="text-sm text-muted-foreground">
        Approve &amp; Publish runs an AI check first — filler is filtered, then the post goes live
        only if it passes the AI-free gate.
      </p>
      <Textarea
        placeholder="Optional feedback for the author…"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="min-h-[80px]"
      />
      <label className="flex items-start gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border"
          checked={adEligibleOnApprove}
          onChange={(e) => setAdEligibleOnApprove(e.target.checked)}
          disabled={!!loading}
        />
        <span>
          Eligible for ads on approve
          <span className="block text-xs text-muted-foreground">
            Still blocked for thin / syndicated slugs by the quality gate.
          </span>
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        <Link href={editHref}>
          <Button variant="outline" className="gap-1.5" disabled={!!loading}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </Link>
        <Button
          variant="destructive"
          className="gap-1.5"
          disabled={!!loading}
          onClick={() => decide("REJECTED")}
        >
          {loading === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          Reject
        </Button>
        <Button
          variant="gradient"
          className="gap-1.5"
          disabled={!!loading}
          onClick={() => decide("APPROVED")}
        >
          {loading === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {loading === "approve" ? "Cleaning AI…" : "Approve & Publish"}
        </Button>
      </div>
    </div>
  );
}
