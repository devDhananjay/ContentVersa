"use client";

import * as React from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Direction = "en|hi" | "hi|en";

export function TranslatorTool() {
  const [direction, setDirection] = React.useState<Direction>("en|hi");
  const [text, setText] = React.useState("");
  const [out, setOut] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function swap() {
    setDirection((d) => (d === "en|hi" ? "hi|en" : "en|hi"));
    setText(out);
    setOut(text);
  }

  async function translate() {
    const q = text.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: q.slice(0, 1500), langpair: direction }),
      });
      const data = (await res.json()) as { translation?: string; error?: string };
      if (!res.ok || !data.translation) {
        throw new Error(data.error || "Translation failed");
      }
      setOut(data.translation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setLoading(false);
    }
  }

  const fromLabel = direction === "en|hi" ? "English" : "Hindi";
  const toLabel = direction === "en|hi" ? "Hindi" : "English";

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between gap-3">
            <span>
              {fromLabel} → {toLabel}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={swap} className="gap-1.5">
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
              onChange={(e) => setText(e.target.value)}
              placeholder={
                direction === "en|hi"
                  ? "Type English text…"
                  : "हिंदी में लिखें…"
              }
              maxLength={1500}
            />
            <p className="text-[11px] text-muted-foreground">{text.length}/1500</p>
          </div>
          <Button onClick={translate} disabled={!text.trim() || loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Translate
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="space-y-1">
            <Label htmlFor="dst">{toLabel}</Label>
            <Textarea
              id="dst"
              rows={5}
              value={out}
              readOnly
              placeholder="Translation appears here"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Free machine translation for everyday use. For legal or medical text,
            use a human translator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
