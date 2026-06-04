"use client";

import * as React from "react";
import NextImage from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Type,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Youtube,
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  Link2,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { shouldSkipImageOptimization, uploadImage } from "@/lib/upload";
import { toYoutubeEmbedUrl } from "@/lib/youtube";
import { YouTubeEmbed } from "@/components/blog/youtube-embed";
import {
  defaultEditorBlocks,
  markdownToBlocks,
  type BlockType,
  type EditorBlock,
} from "@/lib/editor/markdown-blocks";

interface Block extends EditorBlock {}

const SLASH_COMMANDS: { type: BlockType; label: string; description: string; icon: React.ElementType }[] = [
  { type: "paragraph", label: "Text", description: "Plain paragraph", icon: Type },
  { type: "heading-1", label: "Heading 1", description: "Section title", icon: Heading1 },
  { type: "heading-2", label: "Heading 2", description: "Subheading", icon: Heading2 },
  { type: "list", label: "Bullet list", description: "Unordered list", icon: List },
  { type: "ordered-list", label: "Numbered list", description: "Ordered list", icon: ListOrdered },
  { type: "quote", label: "Quote", description: "Pull quote", icon: Quote },
  { type: "code", label: "Code block", description: "Highlighted snippet", icon: Code },
  { type: "image", label: "Image", description: "Embed image URL", icon: ImageIcon },
  { type: "embed", label: "YouTube", description: "Paste a YouTube URL", icon: Youtube },
  { type: "callout", label: "Callout", description: "Highlight a note", icon: Sparkles },
];

const placeholders: Record<BlockType, string> = {
  paragraph: "Type ‘/’ for commands or just write…",
  "heading-1": "Big section heading",
  "heading-2": "Subheading",
  list: "List item",
  "ordered-list": "List item",
  quote: "Drop a quote that hits",
  code: "// paste your code here",
  image: "Image URL",
  embed: "YouTube URL",
  callout: "Important note — heads up.",
};

const INITIAL_BLOCKS: Block[] = defaultEditorBlocks();

export interface BlockEditorHandle {
  toMarkdown(): string;
  loadMarkdown(md: string): void;
}

export const BlockEditor = React.forwardRef<
  BlockEditorHandle,
  { onChange?: (md: string) => void; initialMarkdown?: string }
>(function BlockEditor({ onChange, initialMarkdown }, ref) {
  const [blocks, setBlocks] = React.useState<Block[]>(() =>
    initialMarkdown?.trim() ? markdownToBlocks(initialMarkdown) : INITIAL_BLOCKS
  );
  const [slashOpenFor, setSlashOpenFor] = React.useState<string | null>(null);
  const [slashQuery, setSlashQuery] = React.useState("");

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const addBlock = (afterId: string | null, type: BlockType = "paragraph") => {
    const newBlock: Block = { id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, content: "" };
    if (!afterId) {
      setBlocks((prev) => [...prev, newBlock]);
      return newBlock.id;
    }
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === afterId);
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    return newBlock.id;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, block: Block) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const id = addBlock(block.id, "paragraph");
      setTimeout(() => {
        document.getElementById(`block-${id}`)?.focus();
      }, 0);
    }
    if (e.key === "Backspace" && block.content === "" && blocks.length > 1) {
      e.preventDefault();
      removeBlock(block.id);
    }
  };

  const onTextChange = (block: Block, value: string) => {
    if (value === "/" || value.startsWith("/")) {
      setSlashOpenFor(block.id);
      setSlashQuery(value.slice(1));
    } else {
      setSlashOpenFor(null);
    }
    updateBlock(block.id, { content: value });
  };

  const applyCommand = (block: Block, type: BlockType) => {
    updateBlock(block.id, { type, content: "" });
    setSlashOpenFor(null);
  };

  const toMarkdown = React.useCallback(() => {
    return blocks
      .map((b) => {
        switch (b.type) {
          case "heading-1":
            return `# ${b.content}`;
          case "heading-2":
            return `## ${b.content}`;
          case "list":
            return b.content
              .split("\n")
              .map((l) => `- ${l}`)
              .join("\n");
          case "ordered-list":
            return b.content
              .split("\n")
              .map((l, i) => `${i + 1}. ${l}`)
              .join("\n");
          case "quote":
            return `> ${b.content}`;
          case "code":
            return "```\n" + b.content + "\n```";
          case "image":
            return `![image](${b.content})`;
          case "embed": {
            const embedUrl = toYoutubeEmbedUrl(b.content) ?? b.content.trim();
            return `\n<iframe src="${embedUrl}" />\n`;
          }
          case "callout":
            return `> 💡 ${b.content}`;
          default:
            return b.content;
        }
      })
      .join("\n\n");
  }, [blocks]);

  React.useImperativeHandle(ref, () => ({
    toMarkdown,
    loadMarkdown: (md: string) => {
      setBlocks(md.trim() ? markdownToBlocks(md) : defaultEditorBlocks());
    },
  }));

  React.useEffect(() => {
    if (initialMarkdown?.trim()) {
      setBlocks(markdownToBlocks(initialMarkdown));
    }
  }, [initialMarkdown]);

  React.useEffect(() => {
    onChange?.(toMarkdown());
  }, [blocks, onChange, toMarkdown]);

  return (
    <div className="space-y-2">
      {blocks.map((block) => {
        const showSlash = slashOpenFor === block.id;
        return (
          <div key={block.id} className="group relative">
            <div className="absolute -left-12 top-2 hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                aria-label="Add block"
                onClick={() => {
                  const id = addBlock(block.id);
                  setTimeout(() => document.getElementById(`block-${id}`)?.focus(), 0);
                }}
                className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Drag handle"
                className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Delete block"
                onClick={() => removeBlock(block.id)}
                className="h-7 w-7 rounded-md hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <BlockRenderer
              block={block}
              onChange={(v) => onTextChange(block, v)}
              onKeyDown={(e) => onKeyDown(e, block)}
            />

            <AnimatePresence>
              {showSlash && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border bg-popover p-1 shadow-2xl"
                >
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    Insert block
                  </p>
                  <div className="max-h-72 overflow-auto">
                    {SLASH_COMMANDS.filter((c) =>
                      slashQuery
                        ? c.label.toLowerCase().includes(slashQuery.toLowerCase())
                        : true
                    ).map((c) => (
                      <button
                        key={c.type}
                        type="button"
                        onClick={() => applyCommand(block, c.type)}
                        className="w-full flex items-start gap-3 p-2 rounded-md hover:bg-accent/10 text-left"
                      >
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <c.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{c.label}</p>
                          <p className="text-xs text-muted-foreground">{c.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => addBlock(null)}
        className="w-full text-left px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted/40 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add block — or press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">/</kbd> in a paragraph
      </button>
    </div>
  );
});

const RESIZABLE_BLOCK_TYPES = new Set<BlockType>([
  "paragraph",
  "list",
  "ordered-list",
  "quote",
  "code",
  "callout",
]);

function useAutoResizeTextarea(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  enabled: boolean
) {
  React.useLayoutEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 48)}px`;
  }, [ref, value, enabled]);
}

function BlockRenderer({
  block,
  onChange,
  onKeyDown,
}: {
  block: Block;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  if (block.type === "image") {
    return <ImageBlock block={block} onChange={onChange} />;
  }

  if (block.type === "embed") {
    return <EmbedBlock block={block} onChange={onChange} />;
  }

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const resizable = RESIZABLE_BLOCK_TYPES.has(block.type);
  useAutoResizeTextarea(textareaRef, block.content, resizable);

  const className = cn(
    "w-full bg-transparent border-0 outline-none placeholder:text-muted-foreground/60",
    resizable
      ? "resize-y min-h-[3rem] overflow-auto"
      : "resize-none",
    block.type === "heading-1" && "font-display font-extrabold text-4xl",
    block.type === "heading-2" && "font-display font-bold text-2xl",
    block.type === "quote" && "italic text-foreground/80 border-l-4 border-neon-purple pl-4",
    block.type === "code" && "font-mono text-sm bg-zinc-950 text-zinc-100 p-4 rounded-xl min-h-[6rem]",
    block.type === "callout" && "bg-neon-purple/10 border border-neon-purple/30 rounded-xl px-4 py-3",
    block.type === "paragraph" && "text-base leading-relaxed min-h-[4rem]"
  );

  const defaultRows =
    block.type === "heading-1" || block.type === "heading-2"
      ? 1
      : resizable
        ? Math.max(3, block.content.split("\n").length)
        : Math.max(1, block.content.split("\n").length);

  return (
    <textarea
      ref={textareaRef}
      id={`block-${block.id}`}
      placeholder={placeholders[block.type]}
      value={block.content}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      rows={defaultRows}
      className={className}
    />
  );
}

function ImageBlock({
  block,
  onChange,
}: {
  block: Block;
  onChange: (v: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showUrl, setShowUrl] = React.useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (block.content) {
    return (
      <div className="relative rounded-2xl overflow-hidden border bg-muted/30">
        <div className="relative aspect-[16/9]">
          <NextImage
            src={block.content}
            alt="Blog image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            unoptimized={shouldSkipImageOptimization(block.content)}
          />
        </div>
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-2.5 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur hover:bg-black/80"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className="h-7 w-7 rounded-full bg-black/60 text-white text-xs backdrop-blur hover:bg-black/80 flex items-center justify-center"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div
      id={`block-${block.id}`}
      className="rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-3 text-center"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }}
    >
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ImageIcon className="h-5 w-5" />
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">
          {uploading ? "Uploading…" : "Add an image"}
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, GIF or WebP up to 5MB — or drop a file here
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-60"
        >
          <Upload className="h-3.5 w-3.5" /> Upload from device
        </button>
        <button
          type="button"
          onClick={() => setShowUrl((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          <Link2 className="h-3.5 w-3.5" /> Paste URL
        </button>
      </div>

      {showUrl && (
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          className="w-full max-w-sm rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-neon-purple/40"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = (e.target as HTMLInputElement).value.trim();
              if (v) onChange(v);
            }
          }}
        />
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function EmbedBlock({
  block,
  onChange,
}: {
  block: Block;
  onChange: (v: string) => void;
}) {
  const [showUrl, setShowUrl] = React.useState(false);
  const embedUrl = toYoutubeEmbedUrl(block.content);

  if (embedUrl) {
    return (
      <div className="relative">
        <YouTubeEmbed src={block.content} className="my-0" />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button
            type="button"
            onClick={() => setShowUrl(true)}
            className="px-2.5 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur hover:bg-black/80"
          >
            Change URL
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove video"
            className="h-7 w-7 rounded-full bg-black/60 text-white text-xs backdrop-blur hover:bg-black/80 flex items-center justify-center"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {showUrl && (
          <input
            id={`block-${block.id}`}
            type="url"
            autoFocus
            defaultValue={block.content}
            placeholder="https://www.youtube.com/watch?v=…"
            className="mt-3 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neon-purple/40"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const v = (e.target as HTMLInputElement).value.trim();
                if (v) onChange(v);
                setShowUrl(false);
              }
              if (e.key === "Escape") setShowUrl(false);
            }}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v) onChange(v);
              setShowUrl(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      id={`block-${block.id}`}
      className="rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-3 text-center"
    >
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
        <Youtube className="h-5 w-5" />
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">Embed a YouTube video</p>
        <p className="text-xs text-muted-foreground">
          Paste a watch, share, or embed link
        </p>
      </div>
      <input
        type="url"
        placeholder="https://www.youtube.com/watch?v=…"
        className="w-full max-w-md rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neon-purple/40"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const v = (e.target as HTMLInputElement).value.trim();
            if (v) onChange(v);
          }
        }}
      />
    </div>
  );
}
