"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, PenSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleHasDefaultAiBlogAccess } from "@/lib/auth/blog-permissions-shared";

type AiPerm = "NONE" | "REQUESTED" | "GRANTED" | "DENIED";

const AI_LABELS: Record<AiPerm, string> = {
  NONE: "No access",
  REQUESTED: "Requested — pending",
  GRANTED: "Granted",
  DENIED: "Denied",
};

export function UserBlogPermissions({
  userId,
  userEmail,
  role,
  canWriteBlogs,
  aiBlogPermission,
}: {
  userId: string;
  userEmail: string;
  role: string;
  canWriteBlogs: boolean;
  aiBlogPermission: AiPerm;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<"write" | "ai" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [aiValue, setAiValue] = React.useState<AiPerm>(aiBlogPermission);

  React.useEffect(() => {
    setAiValue(aiBlogPermission);
  }, [aiBlogPermission]);

  const adminDefaultAi = roleHasDefaultAiBlogAccess(role);

  const patch = async (body: Record<string, unknown>, kind: "write" | "ai") => {
    setLoading(kind);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Update failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border bg-card p-6 space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <PenSquare className="h-5 w-5" /> Blog permissions
        </h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
          Control whether {userEmail} can write blogs manually and use AI to generate full blogs.
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Manual blog writing</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {canWriteBlogs
              ? "Allowed — user can create and edit their own blogs."
              : "Blocked — user cannot create new blogs."}
          </p>
        </div>
        <Button
          type="button"
          variant={canWriteBlogs ? "destructive" : "default"}
          size="sm"
          disabled={loading === "write"}
          onClick={() =>
            patch({ canWriteBlogs: !canWriteBlogs }, "write")
          }
        >
          {loading === "write" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {canWriteBlogs ? "Revoke writing" : "Allow writing"}
        </Button>
      </div>

      <div className="border-t pt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-neon-purple" />
          <p className="text-sm font-medium">AI blog writing</p>
          {adminDefaultAi ? (
            <Badge variant="secondary">Admin — always allowed</Badge>
          ) : (
            <Badge
              variant={
                aiBlogPermission === "GRANTED"
                  ? "success"
                  : aiBlogPermission === "REQUESTED"
                    ? "warning"
                    : aiBlogPermission === "DENIED"
                      ? "destructive"
                      : "secondary"
              }
            >
              {AI_LABELS[aiBlogPermission]}
            </Badge>
          )}
        </div>
        {adminDefaultAi ? (
          <p className="text-xs text-muted-foreground">
            ADMIN / SUPER_ADMIN accounts always have AI blog access. No grant needed.
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5 min-w-[200px]">
              <p className="text-xs text-muted-foreground">Permission</p>
              <Select
                value={aiValue}
                onValueChange={(v) => setAiValue(v as AiPerm)}
                disabled={loading === "ai"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">No access</SelectItem>
                  <SelectItem value="REQUESTED">Requested (pending)</SelectItem>
                  <SelectItem value="GRANTED">Granted</SelectItem>
                  <SelectItem value="DENIED">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={loading === "ai" || aiValue === aiBlogPermission}
              onClick={() => patch({ aiBlogPermission: aiValue }, "ai")}
            >
              {loading === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save AI permission
            </Button>
            {aiBlogPermission === "REQUESTED" ? (
              <Button
                type="button"
                size="sm"
                variant="gradient"
                disabled={loading === "ai"}
                onClick={() => patch({ aiBlogPermission: "GRANTED" }, "ai")}
              >
                Approve request
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
