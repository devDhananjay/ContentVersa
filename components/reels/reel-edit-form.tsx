"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Film, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  REEL_MAX_CAPTION_CHARS,
  REEL_MIN_CAPTION_CHARS,
} from "@/lib/reels/constants";
import { cn } from "@/lib/utils";
import type { ReelDashboardRow } from "@/lib/reels/types";

export function ReelEditForm({ reel }: { reel: ReelDashboardRow }) {
  const router = useRouter();
  const [caption, setCaption] = React.useState(reel.caption);
  const [submitting, setSubmitting] = React.useState(false);

  const captionLen = caption.trim().length;
  const captionValid =
    captionLen >= REEL_MIN_CAPTION_CHARS && captionLen <= REEL_MAX_CAPTION_CHARS;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captionValid) {
      toast.error(`Caption must be ${REEL_MIN_CAPTION_CHARS}–${REEL_MAX_CAPTION_CHARS} characters`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reels/mine/${encodeURIComponent(reel.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ caption: caption.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; reel?: { status: string } };
      if (!res.ok) throw new Error(data.error || "Failed to save");

      toast.success(
        data.reel?.status === "PUBLISHED"
          ? "Reel updated and live!"
          : "Reel saved — waiting for admin approval"
      );
      router.push("/dashboard/reels");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const thumb = reel.thumbnailUrl || reel.mediaUrl;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Edit Reel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update the caption. Media cannot be changed — delete and create a new reel instead.
        </p>
      </div>

      <div className="relative aspect-[9/16] max-h-[420px] rounded-2xl overflow-hidden bg-black mx-auto">
        {reel.mediaType === "VIDEO" ? (
          <video src={reel.mediaUrl} poster={thumb} className="w-full h-full object-contain" controls playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="w-full h-full object-contain" />
        )}
        <Badge className="absolute top-3 left-3 gap-1" variant="secondary">
          {reel.mediaType === "VIDEO" ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
          {reel.mediaType === "VIDEO" ? "Video" : "Image"}
        </Badge>
        <Badge className="absolute top-3 right-3" variant="outline">
          {reel.status}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="caption">Caption</Label>
          <span
            className={cn(
              "text-xs",
              captionLen < REEL_MIN_CAPTION_CHARS
                ? "text-amber-500"
                : captionLen > REEL_MAX_CAPTION_CHARS
                  ? "text-destructive"
                  : "text-muted-foreground"
            )}
          >
            {captionLen}/{REEL_MAX_CAPTION_CHARS}
          </span>
        </div>
        <Textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          maxLength={REEL_MAX_CAPTION_CHARS}
          className="resize-none"
        />
      </div>

      <Button type="submit" variant="gradient" className="w-full gap-2" disabled={submitting || !captionValid}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </form>
  );
}
