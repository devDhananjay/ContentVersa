"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function BlogModerationActions({
  blogId,
  status,
}: {
  blogId: string;
  status: string;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = React.useState("");
  const [loading, setLoading] = React.useState<"approve" | "reject" | "publish" | null>(null);

  const decide = async (decision: "APPROVED" | "REJECTED") => {
    setLoading(decision === "APPROVED" ? "approve" : "reject");
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId, decision, feedback: feedback || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Action failed");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  };

  const publishDraft = async () => {
    setLoading("publish");
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}/publish`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Publish failed");
      toast.success("Published to site");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setLoading(null);
    }
  };

  if (status === "DRAFT") {
    return (
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5 space-y-3">
        <h3 className="font-display font-bold">Draft — review before publishing</h3>
        <p className="text-sm text-muted-foreground">
          Edit title, cover, or content if needed, then publish when ready.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/blogs/${blogId}/edit`}>
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
            Publish now
          </Button>
        </div>
      </div>
    );
  }

  if (status !== "PENDING") return null;

  return (
    <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5 space-y-4">
      <h3 className="font-display font-bold">Moderation actions</h3>
      <Textarea
        placeholder="Optional feedback for the author…"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="min-h-[80px]"
      />
      <div className="flex flex-wrap gap-2">
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
          Approve & Publish
        </Button>
      </div>
    </div>
  );
}
