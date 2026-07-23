"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Save,
  Send,
  Tag,
  ImagePlus,
  BookOpen,
  Calendar,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { shouldSkipImageOptimization, uploadImage } from "@/lib/upload";
import { getSiteHostname } from "@/lib/site-config";
import { useRouter } from "next/navigation";
import { AiAssistPanel } from "@/components/dashboard/ai-assist-panel";
import { AiImageGenerator } from "@/components/dashboard/ai-image-generator";
import { TryWithAiButton } from "@/components/dashboard/try-with-ai-button";
import { ImageCropDialog } from "@/components/media/image-crop-dialog";
import type { FullBlogPackage } from "@/lib/ai/full-blog-package";

type BlogDraft = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  premium: boolean;
  metaTitle: string;
  metaDescription: string;
  status: string;
  scheduledFor: string | null;
  seriesSlug: string;
  seriesPart: number | null;
};

/** datetime-local value in the user's timezone */
function toDatetimeLocalValue(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatScheduleLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function BlogEditorForm({
  blogId,
  adminMode = false,
}: {
  blogId?: string;
  /** Admin can edit any blog and keep PUBLISHED in place. */
  adminMode?: boolean;
}) {
  const router = useRouter();
  const editorRef = React.useRef<BlockEditorHandle>(null);
  const [loadingDraft, setLoadingDraft] = React.useState(!!blogId);
  const [editingId, setEditingId] = React.useState<string | null>(blogId ?? null);
  const [liveStatus, setLiveStatus] = React.useState<string>("DRAFT");
  const [editorKey, setEditorKey] = React.useState("new");
  const [initialMarkdown, setInitialMarkdown] = React.useState("");
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
  const [seriesSlug, setSeriesSlug] = React.useState("");
  const [seriesPart, setSeriesPart] = React.useState("");
  const [scheduledFor, setScheduledFor] = React.useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [scheduleInput, setScheduleInput] = React.useState("");
  const [saved, setSaved] = React.useState<Date | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [coverUploading, setCoverUploading] = React.useState(false);
  const [coverError, setCoverError] = React.useState<string | null>(null);
  const [cropFile, setCropFile] = React.useState<File | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = React.useState<string | null>(null);
  const [cropOpen, setCropOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("write");
  const [aiNotice, setAiNotice] = React.useState<string | null>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const aiContext = React.useMemo(
    () => ({ title, excerpt, content: markdown, category }),
    [title, excerpt, markdown, category]
  );

  const applyDraft = (data: BlogDraft) => {
    setEditingId(data.id);
    setLiveStatus(data.status || "DRAFT");
    setScheduledFor(data.scheduledFor ?? null);
    setTitle(data.title);
    setExcerpt(data.excerpt);
    setCover(data.coverImage);
    setCategory(data.category);
    setTags((data.tags ?? []).slice(0, 5));
    setInitialMarkdown(data.content);
    setMarkdown(data.content);
    setSeoTitle(data.metaTitle);
    setSeoDescription(data.metaDescription);
    setPremium(data.premium);
    setSeriesSlug(data.seriesSlug || "");
    setSeriesPart(data.seriesPart != null ? String(data.seriesPart) : "");
    setEditorKey(data.id);
  };

  React.useEffect(() => {
    if (!blogId) return;
    let cancelled = false;
    (async () => {
      setLoadingDraft(true);
      try {
        const endpoint = adminMode
          ? `/api/admin/blogs/${blogId}`
          : `/api/blogs/mine/${blogId}`;
        const res = await fetch(endpoint, { credentials: "include" });
        const json = (await res.json()) as { data?: BlogDraft; error?: string };
        if (!res.ok || !json.data) {
          throw new Error(json.error || "Could not load draft");
        }
        if (!cancelled) applyDraft(json.data);
      } catch (err) {
        if (!cancelled) {
          setSubmitError(err instanceof Error ? err.message : "Failed to load draft");
        }
      } finally {
        if (!cancelled) setLoadingDraft(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blogId, adminMode]);

  const openCoverCrop = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setCoverError("Only image files are supported.");
      return;
    }
    setCoverError(null);
    setCropSourceUrl(null);
    setCropFile(file);
    setCropOpen(true);
  };

  const openCoverRecrop = () => {
    if (!cover.trim()) return;
    setCoverError(null);
    setCropFile(null);
    setCropSourceUrl(cover.trim());
    setCropOpen(true);
  };

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

  const applyFullBlog = (blog: FullBlogPackage, source?: string) => {
    if (blog.excerpt) setExcerpt(blog.excerpt);
    if (blog.category) setCategory(blog.category);
    if (blog.tags?.length) setTags(blog.tags.slice(0, 5));
    if (blog.metaTitle) setSeoTitle(blog.metaTitle);
    if (blog.metaDescription) setSeoDescription(blog.metaDescription);
    editorRef.current?.loadMarkdown(blog.content);
    setMarkdown(blog.content);
    setInitialMarkdown(blog.content);
    setEditorKey((k) => `${k}-full`);
    setActiveTab("preview");
    setAiNotice(
      source === "gemini"
        ? "Full blog generated with Gemini — review Preview, then edit anything."
        : source === "openai"
          ? "Full blog generated with OpenAI — review Preview, then edit anything."
          : "Draft generated offline — add GEMINI_API_KEY for richer AI blogs."
    );
  };

  const applyGeneratedContent = (content: string) => {
    editorRef.current?.loadMarkdown(content);
    setMarkdown(content);
    setEditorKey((k) => `${k}-gen`);
  };

  const generateFromTitle = async () => {
    if (title.trim().length < 5) {
      setSubmitError("Add a title with at least 5 characters first.");
      return;
    }
    setSubmitError(null);
    setGenerating(true);
    setAiNotice(null);
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-from-title",
          title: title.trim(),
          category,
          excerpt,
          content: markdown,
        }),
      });
      const data = (await res.json()) as {
        blog?: FullBlogPackage;
        error?: string;
        source?: string;
      };
      if (!res.ok || !data.blog?.content) {
        const msg = data.error || "Generation failed";
        throw new Error(
          /did not match the expected pattern/i.test(msg)
            ? "AI could not format the draft. Try again with a clearer title."
            : msg
        );
      }
      applyFullBlog(data.blog, data.source);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not generate blog";
      setSubmitError(
        /did not match the expected pattern/i.test(msg)
          ? "AI could not format the draft. Try again with a clearer title."
          : msg
      );
    } finally {
      setGenerating(false);
    }
  };

  const saveBlog = async (
    status: "DRAFT" | "PENDING" | "PUBLISHED",
    opts?: { scheduledFor?: string | null; stayOnPage?: boolean }
  ) => {
    setSubmitError(null);
    if (!title.trim()) {
      setSubmitError("Add a title first.");
      return false;
    }
    const content = (editorRef.current?.toMarkdown() ?? markdown).trim();
    if (status === "PENDING" && content.length < 20) {
      setSubmitError("Write at least 20 characters before submitting for review.");
      return false;
    }
    if ((status === "DRAFT" || status === "PUBLISHED") && !content) {
      setSubmitError("Add some content to save.");
      return false;
    }
    if (title.trim().length < 3) {
      setSubmitError("Title must be at least 3 characters.");
      return false;
    }

    const nextSchedule =
      opts && "scheduledFor" in opts ? opts.scheduledFor : scheduledFor;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content,
        coverImage: cover.trim() || undefined,
        category: category || undefined,
        tags: tags.slice(0, 5),
        premium,
        metaTitle: seoTitle.trim() || undefined,
        metaDescription: seoDescription.trim() || undefined,
        seriesSlug: seriesSlug.trim() || undefined,
        seriesPart: seriesSlug.trim()
          ? Math.max(1, parseInt(seriesPart, 10) || 1)
          : undefined,
        status: nextSchedule ? "DRAFT" : status,
        scheduledFor: nextSchedule === undefined ? undefined : nextSchedule,
      };

      const endpoint =
        adminMode && editingId
          ? `/api/admin/blogs/${editingId}`
          : editingId
            ? `/api/blogs/mine/${editingId}`
            : "/api/blogs";

      const res = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        blog?: { id: string; status?: string };
      };
      if (!res.ok) {
        throw new Error(data.error || "Could not save blog");
      }
      if (!editingId && data.blog?.id) {
        setEditingId(data.blog.id);
      }
      if (data.blog?.status) setLiveStatus(data.blog.status);
      if (opts && "scheduledFor" in opts) {
        setScheduledFor(opts.scheduledFor ?? null);
      }
      if (opts?.stayOnPage) {
        router.refresh();
        return true;
      }
      router.push(adminMode ? "/admin/blogs" : "/dashboard/blogs");
      router.refresh();
      return true;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const isLive = liveStatus === "PUBLISHED";
  const onSubmitForReview = () => saveBlog("PENDING", { scheduledFor: null });
  const onSaveDraft = () => saveBlog("DRAFT"); // keeps existing schedule if any
  const onSavePublished = () => saveBlog("PUBLISHED", { scheduledFor: null });

  const openScheduleDialog = () => {
    const base =
      scheduledFor != null
        ? toDatetimeLocalValue(scheduledFor)
        : toDatetimeLocalValue(new Date(Date.now() + 60 * 60 * 1000));
    setScheduleInput(base);
    setScheduleOpen(true);
  };

  const confirmSchedule = async () => {
    if (!scheduleInput) {
      setSubmitError("Pick a date and time.");
      return;
    }
    const when = new Date(scheduleInput);
    if (Number.isNaN(when.getTime())) {
      setSubmitError("Invalid schedule date.");
      return;
    }
    if (when.getTime() <= Date.now()) {
      setSubmitError("Schedule time must be in the future.");
      return;
    }
    const ok = await saveBlog("DRAFT", {
      scheduledFor: when.toISOString(),
      stayOnPage: true,
    });
    if (ok) {
      setScheduleOpen(false);
      toast.success(`Scheduled for ${formatScheduleLabel(when.toISOString())}`);
    }
  };

  const clearSchedule = async () => {
    const ok = await saveBlog("DRAFT", { scheduledFor: null, stayOnPage: true });
    if (ok) {
      setScheduleOpen(false);
      toast.success("Schedule cleared — saved as draft");
    }
  };

  if (loadingDraft) {
    return (
      <div className="container py-16 max-w-6xl flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading draft…
      </div>
    );
  }

  const showGenerateCta = title.trim().length >= 5;

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6 sticky top-16 z-20 bg-background/80 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Badge variant={isLive ? "success" : "gradient"}>
            {adminMode ? "Admin edit" : editingId ? "Editing" : "Draft"}
            {isLive ? " · Live" : ""}
          </Badge>
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
          {isLive ? (
            <>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={onSaveDraft}
                disabled={submitting}
              >
                <Save className="h-4 w-4" /> Unpublish to draft
              </Button>
              <Button
                variant="gradient"
                onClick={onSavePublished}
                disabled={submitting}
                className="gap-1.5"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="gap-1.5" onClick={onSaveDraft} disabled={submitting}>
                <Save className="h-4 w-4" /> Save draft
              </Button>
              {adminMode ? (
                <Button
                  variant="gradient"
                  onClick={onSavePublished}
                  disabled={submitting}
                  className="gap-1.5"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Save & publish
                </Button>
              ) : (
                <Button variant="gradient" onClick={onSubmitForReview} disabled={submitting} className="gap-1.5">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit for review
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {submitError ? (
        <p className="mb-4 text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2">
          {submitError}
        </p>
      ) : null}

      {aiNotice ? (
        <p className="mb-4 text-sm text-neon-purple rounded-lg border border-neon-purple/30 bg-neon-purple/5 px-4 py-2">
          {aiNotice}
        </p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                  if (f) openCoverCrop(f);
                  e.target.value = "";
                }}
              />
              <ImageCropDialog
                open={cropOpen}
                file={cropFile}
                sourceUrl={cropSourceUrl}
                variant="cover"
                onOpenChange={(open) => {
                  setCropOpen(open);
                  if (!open) {
                    setCropFile(null);
                    setCropSourceUrl(null);
                  }
                }}
                onCropped={handleCoverFile}
              />
              {cover ? (
                <div className="relative aspect-[16/8] rounded-3xl overflow-hidden border">
                  <Image
                    src={cover}
                    alt="cover"
                    fill
                    className="object-cover"
                    sizes="100vw"
                    unoptimized={shouldSkipImageOptimization(cover)}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={openCoverRecrop}
                      className="px-3 py-1.5 rounded-full bg-black/60 text-white text-xs backdrop-blur hover:bg-black/80"
                    >
                      Crop
                    </button>
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
                    if (f) openCoverCrop(f);
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
                  <span className="text-xs">
                    PNG, JPG, WebP up to 5MB · crop to 16:9 before upload
                  </span>
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

              {showGenerateCta ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-neon-purple/30 bg-neon-purple/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-neon-purple" />
                      Write faster with AI
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Fills excerpt, body, tags, category & SEO — then open Preview.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="gradient"
                    size="sm"
                    className="shrink-0 gap-1.5"
                    disabled={generating || submitting}
                    onClick={generateFromTitle}
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate full blog from title
                  </Button>
                </motion.div>
              ) : null}

              <div className="flex items-center justify-between gap-2">
                <Label className="text-muted-foreground text-sm">Excerpt</Label>
                <TryWithAiButton
                  action="excerpt"
                  context={aiContext}
                  onResult={(r) => typeof r === "string" && setExcerpt(r)}
                  disabled={!title.trim() || generating}
                />
              </div>
              <Textarea
                placeholder="Add a short, punchy excerpt that hooks readers…"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="text-lg resize-y min-h-[88px]"
              />

              <div className="border-t pt-6 pl-2 md:pl-12">
                <BlockEditor
                  key={editorKey}
                  ref={editorRef}
                  initialMarkdown={initialMarkdown}
                  onChange={setMarkdown}
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div className="rounded-3xl border bg-card p-6 md:p-10">
                {category ? (
                  <Badge variant="secondary" className="mb-3 capitalize">
                    {CATEGORIES.find((c) => c.slug === category)?.name || category}
                  </Badge>
                ) : null}
                <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
                  {title || "Untitled blog"}
                </h1>
                {excerpt && <p className="mt-4 text-xl text-muted-foreground">{excerpt}</p>}
                {tags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <Badge key={t} variant="outline">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="mt-8 border-t pt-6">
                  {markdown ? renderMarkdown(markdown) : <p className="text-muted-foreground">Start writing to see the preview…</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-xl font-bold">SEO settings</h3>
                  <TryWithAiButton
                    action="seo-title"
                    context={aiContext}
                    label="Try with AI"
                    onResult={(r) => {
                      if (typeof r === "string") {
                        setSeoTitle(r.slice(0, 70));
                        if (!seoDescription.trim() && excerpt) {
                          setSeoDescription(excerpt.slice(0, 160));
                        }
                      }
                    }}
                    disabled={!title.trim()}
                  />
                </div>
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
              <div className="flex items-center justify-between gap-2">
                <Label>Category</Label>
                <TryWithAiButton
                  action="suggest-category"
                  context={aiContext}
                  onResult={(r) => typeof r === "string" && setCategory(r)}
                  disabled={!title.trim()}
                />
              </div>
              <Select
                value={category || undefined}
                onValueChange={setCategory}
              >
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
              <div className="flex items-center justify-between gap-2">
                <Label>Tags (max 5)</Label>
                <TryWithAiButton
                  action="tags"
                  context={aiContext}
                  onResult={(r) => {
                    if (Array.isArray(r)) {
                      setTags((prev) => [...new Set([...prev, ...r])].slice(0, 5));
                    }
                  }}
                  disabled={!title.trim()}
                />
              </div>
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
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-neon-purple" />
                <Label>Multi-part series</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Same series slug on each part — readers get notified when the next part goes live.
              </p>
              <Input
                placeholder="e.g. ai-funding-guide"
                value={seriesSlug}
                onChange={(e) => setSeriesSlug(e.target.value)}
              />
              {seriesSlug.trim() ? (
                <div className="space-y-1.5">
                  <Label>Part number</Label>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    placeholder="1"
                    value={seriesPart}
                    onChange={(e) => setSeriesPart(e.target.value)}
                  />
                </div>
              ) : null}
            </div>
            <div className="space-y-2 pt-2 border-t">
              {scheduledFor ? (
                <div className="rounded-xl border border-neon-purple/30 bg-neon-purple/5 px-3 py-2 text-xs">
                  <p className="font-medium text-neon-purple flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Scheduled
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    {formatScheduleLabel(scheduledFor)} IST
                  </p>
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                disabled={submitting || generating}
                onClick={openScheduleDialog}
              >
                <Calendar className="h-4 w-4" />
                {scheduledFor ? "Edit schedule" : "Schedule"}
              </Button>
            </div>
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
            onApplyContent={applyGeneratedContent}
            onApplyFullBlog={applyFullBlog}
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

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule publish</DialogTitle>
            <DialogDescription>
              Save as draft and auto-publish at the chosen time (Asia/Kolkata). You can edit or
              clear the schedule anytime before it goes live.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="schedule-at">Publish date & time</Label>
            <Input
              id="schedule-at"
              type="datetime-local"
              value={scheduleInput}
              min={toDatetimeLocalValue(new Date(Date.now() + 5 * 60 * 1000))}
              onChange={(e) => setScheduleInput(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {scheduledFor ? (
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={clearSchedule}
              >
                Clear schedule
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="gradient"
              disabled={submitting}
              onClick={confirmSchedule}
              className="gap-1.5"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
