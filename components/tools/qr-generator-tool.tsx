"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QrGeneratorTool() {
  const [text, setText] = React.useState("https://contentverse.co.in");
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!text.trim()) {
        setDataUrl(null);
        return;
      }
      try {
        const url = await QRCode.toDataURL(text.trim(), {
          width: 280,
          margin: 2,
          errorCorrectionLevel: "M",
        });
        if (!cancelled) {
          setDataUrl(url);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setDataUrl(null);
          setError("Could not generate QR for this text");
        }
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">QR code generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="qr-text">Text / URL / UPI</Label>
            <Input
              id="qr-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://… or upi://pay?pa=…"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {dataUrl ? (
            <div className="flex flex-col items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dataUrl} alt="Generated QR code" className="rounded-lg border bg-white p-2" />
              <Button asChild variant="outline">
                <a href={dataUrl} download="contentverse-qr.png">
                  Download PNG
                </a>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
