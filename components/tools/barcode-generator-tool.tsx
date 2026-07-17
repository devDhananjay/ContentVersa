"use client";

import * as React from "react";
import JsBarcode from "jsbarcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BarcodeGeneratorTool() {
  const [text, setText] = React.useState("CONTENTVERSE");
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, text.trim() || "0", {
        format: "CODE128",
        displayValue: true,
        fontSize: 14,
        height: 80,
        margin: 8,
      });
      setError(null);
    } catch {
      setError("Could not encode this value as CODE128");
    }
  }, [text]);

  function downloadSvg() {
    if (!svgRef.current) return;
    const blob = new Blob([svgRef.current.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contentverse-barcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Barcode generator (CODE128)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="barcode-text">Value</Label>
            <Input
              id="barcode-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="SKU / number / text"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="overflow-x-auto rounded-lg border bg-white p-4">
            <svg ref={svgRef} />
          </div>
          <Button type="button" variant="outline" onClick={downloadSvg}>
            Download SVG
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
