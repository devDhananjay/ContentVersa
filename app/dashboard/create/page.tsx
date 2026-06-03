"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Eye,
  Save,
  Send,
  Tag,
  ImagePlus,
  Calendar,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CATEGORIES } from "@/lib/data/categories";
import { BlockEditor, type BlockEditorHandle } from "@/components/editor/block-editor";
import { renderMarkdown } from "@/components/blog/markdown";
import { readingTime } from "@/lib/utils";
import { uploadImage } from "@/lib/upload";
import { getSiteHostname } from "@/lib/site-config";
import { useRouter } from "next/navigation";
import { AiAssistPanel } from "@/components/dashboard/ai-assist-panel";
import { AiImageGenerator } from "@/components/dashboard/ai-image-generator";

export default function CreatePage() {
  const router = useRouter();
  const editorRef = React.useRef<BlockEditorHandle>(null);
  const [title, setTitle] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [cover, setCover] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");
  const [markdown, setMarkdown] = React.useState("");
  const [seoTitle, setSeoTitle] = React.useState("");
  const [seoDescription, setSeoDescription] = React.useState("");
  const [premium, setPremium] = React.useState(false);
  const [allowComments, setAllowComments] = React.useState(true);
  const [saved, setSaved] = React.useState<Date | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [coverUploading, setCoverUploading] = React.useState(false);
  const [coverError, setCoverError] = React.useState<string | null>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const handleCoverFile = async (file: File) => {
    setCoverError(null);
    setCoverUploading(true);
    try {
      const { url } = await uploadImage(file);
      setCover(url);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setCoverUploading(false);
    }
  };

  React.useEffect(() => {
    const t = setInterval(() => setSaved(new Date()), 8000);
    return () => clearInterval(t);
  }, [title, excerpt, markdown, category]);

  const addTag = (raw: string) => {
    const v = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!v || tags.includes(v) || tags.length >= 5) return;
    setTags((t) => [...t, v]);
  };

  const saveBlog = async (status: "DRAFT" | "PENDING") => {
    setSubmitError(null);
    if (!title.trim()) {
      setSubmitError("Add a title first.");
      return;
    }
    const content = (editorRef.current?.toMarkdown() ?? markdown).trim();
    if (status === "PENDING" && content.length < 20) {
      setSubmitError("Write at least 20 characters before submitting for review.");
      return;
    }
    if (status === "DRAFT" && !content) {
      setSubmitError("Add some content to save a draft.");
      return;
    }
    if (title.trim().length < 3) {
      setSubmitError("Title must be at least 3 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          content,
          coverImage: cover.trim() || undefined,
          category: category || undefined,
          tags,
          premium,
          metaTitle: seoTitle.trim() || undefined,
          metaDescription: seoDescription.trim() || undefined,
          status,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Could not save blog");
      }
      router.push(status === "PENDING" ? "/dashboard/blogs" : "/dashboard/blogs");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitForReview = () => saveBlog("PENDING");
  const onSaveDraft = () => saveBlog("DRAFT");

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6 sticky top-16 z-20 bg-background/80 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Badge variant="gradient">Draft</Badge>
          <div className="text-sm text-muted-foreground">
            {saved ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                Autosaved {Math.max(1, Math.floor((Date.now() - +saved) / 1000))}s ago
              </span>
            ) : (
              "Autosave on"
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="gap-1.5">
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={onSaveDraft} disabled={submitting}>
            <Save className="h-4 w-4" /> Save draft
          </Button>
          <Button variant="gradient" onClick={onSubmitForReview} disabled={submitting} className="gap-1.5">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit for review
          </Button>
        </div>
      </div>

      {submitError ? (
        <p className="mb-4 text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2">
          {submitError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <Tabs defaultValue="write">
            <TabsList>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="space-y-6">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCoverFile(f);
                  e.target.value = "";
                }}
              />
              {cover ? (
                <div className="relative aspect-[16/8] rounded-3xl overflow-hidden border">
                  <Image
                    src={cover}
                    alt="cover"
                    fill
                    className="object-cover"
                    sizes="100vw"
                    unoptimized={
                      cover.startsWith("data:") || cover.startsWith("/uploads/")
                    }
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-full bg-black/60 text-white text-xs backdrop-blur hover:bg-black/80"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setCover("")}
                      className="px-3 py-1.5 rounded-full bg-black/60 text-white text-xs backdrop-blur hover:bg-black/80"
                    >
                      Remove cover
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleCoverFile(f);
                  }}
                  className="w-full aspect-[16/6] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-neon-purple/60 hover:text-foreground transition-colors"
                >
                  {coverUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <ImagePlus className="h-8 w-8" />
                  )}
                  <span className="font-medium">
                    {coverUploading ? "Uploading…" : "Upload cover image"}
                  </span>
                  <span className="text-xs">PNG, JPG, WebP up to 5MB · 1600×900 recommended</span>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="gradient"
                      disabled={coverUploading}
                      onClick={() => coverInputRef.current?.click()}
                    >
                      Choose file
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={coverUploading}
                      onClick={() => {
                        const url = window.prompt("Paste cover image URL");
                        if (url) setCover(url.trim());
                      }}
                    >
                      Paste URL
                    </Button>
                  </div>
                  {coverError && (
                    <p className="text-xs text-destructive mt-1">{coverError}</p>
                  )}
                </div>
              )}

              <input
                type="text"
                placeholder="Untitled blog…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-5xl font-display font-extrabold tracking-tight placeholder:text-muted-foreground/50 outline-none border-0"
              />

              <Textarea
                placeholder="Add a short, punchy excerpt that hooks readers…"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="text-lg border-0 px-0 focus-visible:ring-0 resize-none"
              />

              <div className="border-t pt-6 pl-2 md:pl-12">
                <BlockEditor ref={editorRef} onChange={setMarkdown} />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div className="rounded-3xl border bg-card p-6 md:p-10">
                <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
                  {title || "Untitled blog"}
                </h1>
                {excerpt && <p className="mt-4 text-xl text-muted-foreground">{excerpt}</p>}
                <div className="mt-8 border-t pt-6">
                  {markdown ? renderMarkdown(markdown) : <p className="text-muted-foreground">Start writing to see the preview…</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <h3 className="font-display text-xl font-bold">SEO settings</h3>
                <div className="space-y-1.5">
                  <Label>Meta title</Label>
                  <Input
                    placeholder={title || "Auto from title"}
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    maxLength={70}
                  />
                  <p className="text-xs text-muted-foreground text-right">{seoTitle.length}/70</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Meta description</Label>
                  <Textarea
                    placeholder={excerpt || "Auto from excerpt"}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground text-right">{seoDescription.length}/160</p>
                </div>

                <div className="rounded-xl border p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Google preview
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-base font-medium">
                    {seoTitle || title || "Your blog title"} · ContentVerse
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-500">
                    {getSiteHostname()} › blog › your-slug
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {seoDescription || excerpt || "Your meta description will appear here…"}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border bg-card p-5 space-y-4"
          >
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" /> Publish settings
            </h3>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tags (max 5)</Label>
              <Input
                placeholder="Press Enter to add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tagInput);
                    setTagInput("");
                  }
                }}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setTags((s) => s.filter((x) => x !== t))}
                  >
                    #{t} ✕
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Premium content</Label>
                <p className="text-xs text-muted-foreground">Behind paywall</p>
              </div>
              <Switch checked={premium} onCheckedChange={setPremium} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow comments</Label>
                <p className="text-xs text-muted-foreground">Default on</p>
              </div>
              <Switch checked={allowComments} onCheckedChange={setAllowComments} />
            </div>
            <Button variant="outline" className="w-full gap-2">
              <Calendar className="h-4 w-4" /> Schedule
            </Button>
          </motion.div>

          <AiAssistPanel
            title={title}
            excerpt={excerpt}
            content={markdown}
            category={category}
            onApplyTitle={setTitle}
            onApplyExcerpt={setExcerpt}
            onApplySeoTitle={setSeoTitle}
            onApplyTags={(t) => setTags((prev) => [...new Set([...prev, ...t])].slice(0, 5))}
          />

          <AiImageGenerator
            title={title}
            category={category}
            onUseImage={setCover}
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border bg-card p-5"
          >
            <h3 className="font-display font-semibold mb-3">Stats</h3>
            <ul className="text-sm space-y-2">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Word count</span>
                <span className="font-semibold">{markdown.trim().split(/\s+/).filter(Boolean).length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Reading time</span>
                <span className="font-semibold">{readingTime(markdown)} min</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Tags</span>
                <span className="font-semibold">{tags.length}/5</span>
              </li>
            </ul>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
