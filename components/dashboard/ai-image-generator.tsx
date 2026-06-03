"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImageFromUrl } from "@/lib/upload";

export function AiImageGenerator({
  title,
  category,
  onUseImage,
}: {
  title: string;
  category: string;
  onUseImage: (url: string) => void;
}) {
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const generate = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-image",
          title,
          category,
          imagePrompt: prompt.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        imageUrl?: string;
        prompt?: string;
        source?: string;
        error?: string;
        note?: string;
      };
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error || data.note || "Generation failed");
      }
      if (data.imageUrl.includes("picsum.photos")) {
        throw new Error(
          "Gemini image failed. Add GEMINI_API_KEY to .env and restart the server."
        );
      }
      if (data.prompt && !prompt) setPrompt(data.prompt);
      setPreview(data.imageUrl);
      setSource(data.source || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const useAsCover = async () => {
    if (!preview) return;
    setError(null);
    setUploading(true);
    try {
      const { url } = await uploadImageFromUrl(preview);
      onUseImage(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not set cover");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ImagePlus className="h-4 w-4 text-neon-cyan" />
        <h3 className="font-display font-semibold text-sm">AI Image Generator</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Gemini creates your cover — we upload it so it always shows on the blog.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="img-prompt" className="text-xs">
          Prompt
        </Label>
        <Input
          id="img-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. futuristic AI workspace, purple neon, editorial"
          className="text-sm"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2"
        disabled={loading}
        onClick={generate}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Generate image
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {preview && (
        <div className="space-y-2">
          <div className="relative aspect-video rounded-xl overflow-hidden border">
            <Image
              src={preview}
              alt="Generated preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          {source && (
            <p className="text-[10px] text-muted-foreground text-center">
              {source === "gemini" ? "Gemini AI" : "Preview"}
            </p>
          )}
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="w-full"
            disabled={uploading}
            onClick={useAsCover}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Use as cover image"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
