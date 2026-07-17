import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { TOOL_REGISTRY, toolPath } from "@/lib/tools/registry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolHubCardIcon } from "./tool-hub-card-icon";

export function ToolsHubGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TOOL_REGISTRY.map((tool) => (
        <Link key={tool.slug} href={toolPath(tool.slug)} className="group">
          <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ToolHubCardIcon slug={tool.slug} />
                </span>
                {tool.badge ? <Badge variant="outline">{tool.badge}</Badge> : null}
              </div>
              <CardTitle className="text-lg group-hover:text-primary">
                {tool.shortTitle}
              </CardTitle>
              <CardDescription className="line-clamp-3 text-sm">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open tool
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function ToolsHubIntro() {
  return (
    <header className="max-w-3xl space-y-3">
      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
        <Wrench className="h-3.5 w-3.5" />
        Free · India
      </p>
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        India Utility Tools
      </h1>
      <p className="text-sm text-muted-foreground md:text-base leading-relaxed">
        Free daily-use tools for Indian users — weather, currency, QR & barcode generators, FSSAI
        format check, public holidays, nearby hotels & hospitals, IFSC lookup, pincode search, RTO
        codes, PAN/GSTIN format check, EMI & SIP calculators, and petrol/diesel prices. No sign-up
        required.
      </p>
    </header>
  );
}
