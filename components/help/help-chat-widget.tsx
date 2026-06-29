"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  BookOpen,
  ExternalLink,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HELP_SUGGESTIONS, detectLocale } from "@/lib/help/chat-knowledge";
import { AccessibilityHub } from "@/components/a11y/accessibility-hub";

export const HELP_CHAT_OPEN_EVENT = "contentverse:help-chat-open";
const WELCOME_SESSION_KEY = "cv-help-welcome-v1";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "faq" | "search" | "gemini" | "local";
  links?: { label: string; href: string }[];
};

type Locale = "en" | "hi";

const COPY = {
  en: {
    title: "ContentVerse Help",
    subtitle: "Powered by Gemini AI · site guide",
    placeholder: "Ask anything about the site…",
    send: "Send",
    thinking: "Finding the best answer…",
    poweredFaq: "Instant answer",
    poweredSearch: "From site search",
    poweredAi: "Gemini AI",
    close: "Close help",
    open: "Open help chat",
    newsletterTitle: "Weekly newsletter",
    newsletterHint: "Trending reads — opt in only",
    newsletterPlaceholder: "your@email.com",
    newsletterBtn: "Subscribe",
    newsletterSuccess: "Subscribed! Check your inbox.",
  },
  hi: {
    title: "ContentVerse सहायक",
    subtitle: "Gemini AI · site guide",
    placeholder: "साइट के बारे में पूछें…",
    send: "भेजें",
    thinking: "सही जवाब ढूँढ रहे हैं…",
    poweredFaq: "तुरंत जवाब",
    poweredSearch: "साइट खोज से",
    poweredAi: "Gemini AI",
    close: "बंद करें",
    open: "सहायक खोलें",
    newsletterTitle: "Weekly newsletter",
    newsletterHint: "Trending reads — सिर्फ opt-in",
    newsletterPlaceholder: "your@email.com",
    newsletterBtn: "Subscribe",
    newsletterSuccess: "Subscribe हो गया! Inbox check करें।",
  },
} as const;

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

function sourceBadge(source: ChatMessage["source"], locale: Locale) {
  if (!source) return null;
  const c = COPY[locale];
  const label =
    source === "faq"
      ? c.poweredFaq
      : source === "search"
        ? c.poweredSearch
        : source === "gemini"
          ? c.poweredAi
          : null;
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
      {source === "gemini" && <Sparkles className="h-3 w-3 text-neon-purple" />}
      {label}
    </span>
  );
}

function NewsletterMiniForm({ locale }: { locale: Locale }) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const t = COPY[locale];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading || done) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        toast.error(data.error || "Could not subscribe");
        return;
      }
      setDone(true);
      toast.success(t.newsletterSuccess);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p className="text-xs text-emerald-500 font-medium px-1">{t.newsletterSuccess}</p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-dashed border-neon-purple/30 bg-neon-purple/5 p-2.5 space-y-2"
    >
      <div className="flex items-center gap-2 text-xs font-semibold">
        <Mail className="h-3.5 w-3.5 text-neon-purple" />
        {t.newsletterTitle}
      </div>
      <p className="text-[11px] text-muted-foreground -mt-1">{t.newsletterHint}</p>
      <div className="flex gap-1.5">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.newsletterPlaceholder}
          className="flex-1 min-w-0 h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="sm" className="h-8 text-xs shrink-0" disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t.newsletterBtn}
        </Button>
      </div>
    </form>
  );
}

export function HelpChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [locale, setLocale] = React.useState<Locale>("en");
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [showNewsletter, setShowNewsletter] = React.useState(false);
  const [welcomeDone, setWelcomeDone] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const welcomeLoadingRef = React.useRef(false);

  const t = COPY[locale];
  const hidden = pathname.startsWith("/admin");

  const loadWelcome = React.useCallback(async (welcomeLocale?: Locale) => {
    if (welcomeLoadingRef.current) return;
    welcomeLoadingRef.current = true;
    const lang =
      welcomeLocale ??
      (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("hi")
        ? "hi"
        : "en");
    setLocale(lang);
    setLoading(true);
    try {
      const res = await fetch("/api/help/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ welcome: true, pagePath: pathname, locale: lang }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        reply?: string;
        source?: ChatMessage["source"];
        links?: { label: string; href: string }[];
      };
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: data.reply || "Hello! Namaste! Welcome to ContentVerse.",
          source: data.source ?? "gemini",
          links: data.links,
        },
      ]);
      setShowNewsletter(true);
    } catch {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! **Namaste!** 🙏 Welcome to ContentVerse. Ask me anything — or subscribe to our weekly newsletter below.",
          source: "local",
          links: [{ label: "Newsletter", href: "/#newsletter" }],
        },
      ]);
      setShowNewsletter(true);
    } finally {
      setLoading(false);
      setWelcomeDone(true);
    }
  }, [pathname]);

  React.useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      if (messages.length === 0 && !welcomeDone) void loadWelcome();
    };
    window.addEventListener(HELP_CHAT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(HELP_CHAT_OPEN_EVENT, onOpen);
  }, [loadWelcome, messages.length, welcomeDone]);

  React.useEffect(() => {
    if (hidden) return;
    if (sessionStorage.getItem(WELCOME_SESSION_KEY)) return;

    const timer = window.setTimeout(() => {
      sessionStorage.setItem(WELCOME_SESSION_KEY, "1");
      setOpen(true);
      void loadWelcome();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [hidden, loadWelcome]);

  React.useEffect(() => {
    if (open && messages.length === 0 && !welcomeDone && !loading) {
      void loadWelcome();
    }
  }, [open, messages.length, welcomeDone, loading, loadWelcome]);

  React.useEffect(() => {
    if (open) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      if (!loading) inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  const sendMessage = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const msgLocale = detectLocale(trimmed);
      setLocale(msgLocale);

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      const history = [...messages.filter((m) => m.id !== "welcome"), userMsg];
      setMessages((prev) => [...prev.filter((m) => m.id !== "welcome"), userMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/help/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: history
              .slice(-10)
              .map((m) => ({ role: m.role, content: m.content })),
            pagePath: pathname,
            locale: msgLocale,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          reply?: string;
          source?: ChatMessage["source"];
          links?: { label: string; href: string }[];
        };

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content:
              data.reply ||
              (msgLocale === "hi"
                ? "कुछ गलत हो गया। /contact पर लिखें।"
                : "Something went wrong. Try /contact."),
            source: data.source,
            links: data.links,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content:
              msgLocale === "hi"
                ? "Network error। बाद में try करें।"
                : "Network error. Try again later.",
            source: "local",
            links: [{ label: "Contact", href: "/contact" }],
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, pathname]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  if (hidden) return null;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className={cn(
            "pointer-events-auto w-[min(100vw-2rem,22rem)] sm:w-96 rounded-2xl border border-border/80",
            "bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20",
            "flex flex-col overflow-hidden max-h-[min(70vh,32rem)] mb-1"
          )}
        >
          <header className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-neon-purple shrink-0" />
                <p className="font-semibold text-sm truncate">{t.title}</p>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex rounded-lg border border-border/60 overflow-hidden text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setLocale("en");
                      if (messages.length <= 1) void loadWelcome("en");
                    }}
                  className={cn(
                    "px-2 py-1 transition-colors",
                    locale === "en" ? "bg-neon-purple/20 text-foreground" : "text-muted-foreground"
                  )}
                >
                  EN
                </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocale("hi");
                      if (messages.length <= 1) void loadWelcome("hi");
                    }}
                  className={cn(
                    "px-2 py-1 transition-colors",
                    locale === "hi" ? "bg-neon-purple/20 text-foreground" : "text-muted-foreground"
                  )}
                >
                  हि
                </button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={t.close}
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-[12rem]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-neon-purple/20 text-foreground rounded-br-md"
                      : "bg-muted/60 text-foreground rounded-bl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap">{renderInline(msg.content)}</p>
                  {msg.role === "assistant" && sourceBadge(msg.source, locale)}
                  {msg.links && msg.links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/80 px-2 py-1 text-xs hover:border-neon-purple/50 transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          {link.label}
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t.thinking}
              </div>
            )}
            {showNewsletter && !loading && messages.some((m) => m.id === "welcome") && (
              <NewsletterMiniForm locale={locale} />
            )}
          </div>

          <div className="border-t border-border/60 px-3 py-2">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {HELP_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  disabled={loading}
                  className="rounded-full border border-dashed border-border/70 bg-muted/30 px-2.5 py-1 text-[11px] hover:border-neon-purple/40 transition-colors disabled:opacity-50"
                  onClick={() => {
                    if (s.href) {
                      setOpen(false);
                      window.location.href = s.href;
                      return;
                    }
                    if (s.query) void sendMessage(s.query);
                  }}
                >
                  {locale === "hi" ? s.labelHi : s.label}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                maxLength={500}
                disabled={loading}
                className="flex-1 min-w-0 h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 shrink-0"
                disabled={loading || !input.trim()}
                aria-label={t.send}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="pointer-events-auto flex items-center gap-2.5">
        <Button
          type="button"
          variant="gradient"
          size="icon"
          className="h-11 w-11 rounded-full shadow-neon"
          aria-label={open ? t.close : t.open}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </Button>
        <AccessibilityHub />
      </div>
    </>
  );
}

export function openHelpChat() {
  window.dispatchEvent(new CustomEvent(HELP_CHAT_OPEN_EVENT));
}
