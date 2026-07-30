"use client";

import * as React from "react";
import { ArrowLeftRight, Copy, Check, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Direction = "en|hi" | "hi|en";

function mymemoryPair(langpair: Direction) {
  return langpair === "hi|en" ? "hi-IN|en-GB" : "en-GB|hi-IN";
}

async function translateClientSide(
  text: string,
  langpair: Direction,
  signal: AbortSignal
): Promise<string> {
  // 1) Direct MyMemory (CORS-friendly) — works even if /api is blocked
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(mymemoryPair(langpair))}`;
    const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
    if (res.ok) {
      const json = (await res.json()) as {
        responseData?: { translatedText?: string };
        responseStatus?: number | string;
      };
      const translated = json.responseData?.translatedText?.trim();
      const status = Number(json.responseStatus);
      if (
        translated &&
        (!status || status === 200) &&
        !/MYMEMORY WARNING/i.test(translated)
      ) {
        return translated;
      }
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
  }

  // 2) Our API (MyMemory + Gemini)
  const res = await fetch("/api/tools/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, langpair }),
    signal,
  });
  const data = (await res.json()) as { translation?: string; error?: string };
  if (!res.ok || !data.translation) {
    throw new Error(data.error || "Translation failed");
  }
  return data.translation;
}

export function TranslatorTool() {
  const [direction, setDirection] = React.useState<Direction>("en|hi");
  const [text, setText] = React.useState("");
  const [out, setOut] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const fromLabel = direction === "en|hi" ? "English" : "Hindi";
  const toLabel = direction === "en|hi" ? "Hindi" : "English";

  const runTranslate = React.useCallback(async (value: string, pair: Direction) => {
    const q = value.trim();
    if (!q) {
      setOut("");
      setError(null);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const timer = setTimeout(() => ac.abort(), 12000);

    setLoading(true);
    setError(null);
    try {
      const translated = await translateClientSide(q.slice(0, 1500), pair, ac.signal);
      if (!ac.signal.aborted) setOut(translated);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("Translation timed out. Try a shorter sentence.");
      } else {
        setError(e instanceof Error ? e.message : "Translation failed");
      }
    } finally {
      clearTimeout(timer);
      if (abortRef.current === ac) setLoading(false);
    }
  }, []);

  function onTextChange(next: string) {
    setText(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runTranslate(next, direction);
    }, 550);
  }

  function swap() {
    const nextDir: Direction = direction === "en|hi" ? "hi|en" : "en|hi";
    setDirection(nextDir);
    setText(out);
    setOut(text);
    if (out.trim()) {
      void runTranslate(out, nextDir);
    }
  }

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function copyOut() {
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between gap-3">
            <span>
              {fromLabel} → {toLabel}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={swap}
              className="gap-1.5"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Swap
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="src">{fromLabel}</Label>
            <Textarea
              id="src"
              rows={5}
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  void runTranslate(text, direction);
                }
              }}
              placeholder={
                direction === "en|hi"
                  ? "Type English — translation appears below…"
                  : "हिंदी लिखें — अनुवाद नीचे दिखेगा…"
              }
              maxLength={1500}
            />
            <p className="text-[11px] text-muted-foreground">{text.length}/1500</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => void runTranslate(text, direction)}
              disabled={!text.trim() || loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Translate
            </Button>
            {loading ? (
              <span className="text-xs text-muted-foreground">Translating…</span>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="dst">{toLabel}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void copyOut()}
                disabled={!out}
                className="h-8 gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div
              id="dst"
              className="min-h-[120px] w-full rounded-xl border border-input bg-muted/30 px-4 py-3 text-sm whitespace-pre-wrap break-words"
              aria-live="polite"
            >
              {out || (
                <span className="text-muted-foreground">
                  Translation appears here
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Auto-translates as you type. For legal or medical text, use a human
            translator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
