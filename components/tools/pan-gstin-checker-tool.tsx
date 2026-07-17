"use client";

import * as React from "react";
import { validateGstin, validatePan } from "@/lib/tools/pan-gstin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PanGstinCheckerTool() {
  const [pan, setPan] = React.useState("");
  const [gstin, setGstin] = React.useState("");

  const panResult = React.useMemo(
    () => (pan.trim() ? validatePan(pan) : null),
    [pan]
  );
  const gstinResult = React.useMemo(
    () => (gstin.trim() ? validateGstin(gstin) : null),
    [gstin]
  );

  return (
    <div className="max-w-2xl">
      <Tabs defaultValue="pan">
        <TabsList className="mb-4">
          <TabsTrigger value="pan">PAN</TabsTrigger>
          <TabsTrigger value="gstin">GSTIN</TabsTrigger>
        </TabsList>

        <TabsContent value="pan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PAN format check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="pan">PAN number</Label>
                <Input
                  id="pan"
                  placeholder="ABCDE1234F"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                  maxLength={10}
                />
              </div>
              {panResult ? <ValidationCard valid={panResult.valid} message={panResult.message} extra={panResult.entityType ? `Entity: ${panResult.entityType}` : undefined} /> : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gstin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GSTIN format check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  placeholder="29AABCT1332L1ZS"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                  maxLength={15}
                />
              </div>
              {gstinResult ? (
                <ValidationCard
                  valid={gstinResult.valid}
                  message={gstinResult.message}
                  extra={[
                    gstinResult.stateName && `State: ${gstinResult.stateName}`,
                    gstinResult.panEmbedded && `PAN in GSTIN: ${gstinResult.panEmbedded}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-xs text-muted-foreground">
        Format and checksum validation only. Does not verify with CBDT or GSTN live
        databases.
      </p>
    </div>
  );
}

function ValidationCard({
  valid,
  message,
  extra,
}: {
  valid: boolean;
  message: string;
  extra?: string;
}) {
  return (
    <div
      className={`rounded-lg border p-3 text-sm ${
        valid ? "border-emerald-500/40 bg-emerald-500/5" : "border-destructive/40 bg-destructive/5"
      }`}
    >
      <p className="font-medium">{message}</p>
      {extra ? <p className="mt-1 text-muted-foreground">{extra}</p> : null}
    </div>
  );
}
