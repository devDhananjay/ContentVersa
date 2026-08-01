"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ExternalLink,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CV_AI_FAQS,
  CV_AI_MODES,
  getCvAiMode,
  type CvAiModeId,
} from "@/lib/ai/cv-ai-modes";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  links?: { label: string; href: string }[];
};

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function ContentVerseAiHub() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const modeId = (searchParams.get("mode") || "ask") as CvAiModeId;
  const mode = getCvAiMode(modeId);

  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMessages([]);
    setInput("");
  }, [mode.id]);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  function selectMode(id: CvAiModeId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || busy) return;

    if (mode.kind === "tool" && mode.toolHref) {
      window.location.href = mode.toolHref;
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    try {
      const history = [...messages, userMsg].slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode: mode.id, history }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        reply?: string;
        links?: { label: string; href: string }[];
        error?: string;
      };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || "AI request failed");
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply!,
          links: data.links,
        },
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ContentVerse India AI failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CV_AI_MODES.map((m) => {
          const Icon = m.icon;
          const active = m.id === mode.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => selectMode(m.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                active
                  ? "border-violet-400/50 bg-violet-500/15 shadow-[0_0_32px_-12px_rgba(167,139,250,0.55)]"
                  : "border-border/50 bg-muted/10 hover:border-violet-500/30 hover:bg-violet-500/5"
              )}
            >
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-300">
                <Icon className="h-3.5 w-3.5" />
                {m.shortTitle}
              </span>
              <p className="mt-1.5 font-display text-base font-semibold tracking-tight">
                {m.title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {m.description}
              </p>
            </button>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-950/40 via-background to-background">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 px-5 py-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              ContentVerse India AI · {mode.title}
            </p>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {mode.description}
            </p>
          </div>
          {mode.toolHref ? (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={mode.toolHref}>
                {mode.toolLabel || "Open tool"}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : null}
        </div>

        {mode.kind === "tool" ? (
          <div className="space-y-4 px-5 py-8">
            <p className="text-sm text-muted-foreground">
              This mode opens a dedicated ContentVerse India tool for uploads and structured
              results:
            </p>
            <ul className="space-y-2 text-sm">
              {mode.examples.map((ex) => (
                <li key={ex} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  {ex}
                </li>
              ))}
            </ul>
            <Button asChild variant="gradient" className="gap-2">
              <Link href={mode.toolHref!}>
                {mode.toolLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div ref={listRef} className="max-h-[420px] space-y-3 overflow-y-auto px-5 py-4">
              {messages.length === 0 ? (
                <div className="space-y-3 py-4">
                  <p className="text-sm text-muted-foreground">Try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {mode.examples.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => send(ex)}
                        className="rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-left text-xs text-violet-100 hover:bg-violet-500/20"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "ml-auto bg-violet-500/20 text-foreground"
                      : "mr-auto border border-border/50 bg-muted/20 text-muted-foreground"
                  )}
                >
                  {renderInline(m.content)}
                  {m.links?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 px-2 py-0.5 text-[11px] text-violet-200 hover:bg-violet-500/15"
                        >
                          {l.label}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {busy ? (
                <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ContentVerse India AI is thinking…
                </p>
              ) : null}
            </div>

            <form
              className="flex gap-2 border-t border-border/40 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode.placeholder}
                rows={3}
                className="min-h-[76px] flex-1 resize-y rounded-2xl border border-border/60 bg-background/80 px-3.5 py-2.5 text-sm outline-none ring-violet-500/30 placeholder:text-muted-foreground focus:ring-2"
              />
              <Button
                type="submit"
                variant="gradient"
                disabled={busy || !input.trim()}
                className="h-auto self-end gap-1.5 px-4"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Run
              </Button>
            </form>
          </>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Why ContentVerse India AI
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Not just a chatbot — modes that connect to real ContentVerse India products: MoneyVerse
          bank PDFs & screenshot OCR, finance calculators, jobs, and India guides.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">FAQ</h2>
        <div className="space-y-2">
          {CV_AI_FAQS.map((f) => (
            <div
              key={f.question}
              className="rounded-xl border border-border/50 bg-muted/15 px-4 py-3"
            >
              <h3 className="text-sm font-semibold">{f.question}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
