"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function newUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function UuidGeneratorTool() {
  const [uuids, setUuids] = React.useState<string[]>(() => [newUuid()]);
  const [copied, setCopied] = React.useState(false);

  function regenerate(count = 1) {
    setUuids(Array.from({ length: count }, () => newUuid()));
    setCopied(false);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopied(true);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">UUID v4 generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => regenerate(1)}>
              Generate 1
            </Button>
            <Button type="button" variant="outline" onClick={() => regenerate(5)}>
              Generate 5
            </Button>
            <Button type="button" variant="outline" onClick={() => regenerate(10)}>
              Generate 10
            </Button>
            <Button type="button" variant="secondary" onClick={() => void copyAll()}>
              {copied ? "Copied" : "Copy all"}
            </Button>
          </div>
          <ul className="space-y-2 font-mono text-sm">
            {uuids.map((id) => (
              <li key={id} className="rounded-lg border bg-muted/20 px-3 py-2 break-all">
                {id}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
