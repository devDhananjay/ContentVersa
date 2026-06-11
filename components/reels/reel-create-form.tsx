"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Film, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  REEL_MAX_CAPTION_CHARS,
  REEL_MIN_CAPTION_CHARS,
} from "@/lib/reels/constants";
import { uploadReelMedia } from "@/lib/reels/upload-client";
import { cn } from "@/lib/utils";

export function ReelCreateForm() {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [caption, setCaption] = React.useState("");
  const [preview, setPreview] = React.useState<string | null>(null);
  const [mediaType, setMediaType] = React.useState<"IMAGE" | "VIDEO" | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const captionLen = caption.trim().length;
  const captionValid =
    captionLen >= REEL_MIN_CAPTION_CHARS && captionLen <= REEL_MAX_CAPTION_CHARS;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setFile(f);
    setMediaType(f.type.startsWith("video/") ? "VIDEO" : "IMAGE");
  }

  function clearMedia() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setMediaType(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !mediaType) {
      toast.error("Please select an image or video");
      return;
    }
    if (!captionValid) {
      toast.error(`Caption must be ${REEL_MIN_CAPTION_CHARS}–${REEL_MAX_CAPTION_CHARS} characters`);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadReelMedia(file);
      setUploading(false);
      setSubmitting(true);

      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: caption.trim(),
          mediaUrl: uploaded.url,
          thumbnailUrl: uploaded.thumbnailUrl,
          mediaType: uploaded.mediaType,
          durationSec: uploaded.durationSec,
          cloudinaryId: uploaded.cloudinaryId,
          status: "PENDING",
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        reel?: { status: string };
        moderation?: { held: boolean; reason?: string };
      };
      if (!res.ok) throw new Error(data.error || "Failed to publish");

      toast.success(
        data.reel?.status === "PUBLISHED"
          ? "Reel is live!"
          : "Reel held for review — sensitive content detected"
      );
      router.push("/dashboard/reels");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  }

  const busy = uploading || submitting;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Create Reel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a short video or image. Safe reels go live instantly; flagged content is reviewed first.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Media</Label>
        {!preview ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-[9/16] max-h-[420px] rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 flex flex-col items-center justify-center gap-3 hover:bg-muted/40 transition-colors"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Tap to upload</p>
              <p className="text-xs text-muted-foreground mt-1">
                Video (MP4, WebM, MOV) up to 20MB · Image up to 5MB
              </p>
            </div>
          </button>
        ) : (
          <div className="relative aspect-[9/16] max-h-[420px] rounded-2xl overflow-hidden bg-black mx-auto">
            {mediaType === "VIDEO" ? (
              <video src={preview} className="w-full h-full object-contain" controls playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            )}
            <button
              type="button"
              onClick={clearMedia}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
            <Badge className="absolute top-3 left-3 gap-1" variant="secondary">
              {mediaType === "VIDEO" ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
              {mediaType === "VIDEO" ? "Video" : "Image"}
            </Badge>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileSelect}
        />
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
            {captionLen < REEL_MIN_CAPTION_CHARS && ` (min ${REEL_MIN_CAPTION_CHARS})`}
          </span>
        </div>
        <Textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write something about your reel…"
          rows={4}
          maxLength={REEL_MAX_CAPTION_CHARS}
          className="resize-none"
        />
      </div>

      <Button
        type="submit"
        variant="gradient"
        className="w-full gap-2"
        disabled={busy || !file || !captionValid}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {uploading ? "Uploading media…" : "Publishing…"}
          </>
        ) : (
          "Publish Reel"
        )}
      </Button>
    </form>
  );
}
