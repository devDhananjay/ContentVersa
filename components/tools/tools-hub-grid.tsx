"use client";

import { ArrowRight, Wrench } from "lucide-react";
import { TOOL_REGISTRY, toolPath } from "@/lib/tools/registry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocaleLink } from "@/components/i18n/locale-link";
import { useDictionary } from "@/components/i18n/use-dictionary";
import { ToolHubCardIcon } from "./tool-hub-card-icon";

export function ToolsHubGrid() {
  const { t } = useDictionary();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TOOL_REGISTRY.map((tool) => (
        <LocaleLink key={tool.slug} href={toolPath(tool.slug)} className="group">
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
                {t("common.openTool")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </CardContent>
          </Card>
        </LocaleLink>
      ))}
    </div>
  );
}

export function ToolsHubIntro() {
  const { t } = useDictionary();
  return (
    <header className="max-w-3xl space-y-3">
      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
        <Wrench className="h-3.5 w-3.5" />
        {t("hubs.toolsBadge")}
      </p>
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        {t("hubs.toolsTitle")}
      </h1>
      <p className="text-sm text-muted-foreground md:text-base leading-relaxed">
        {t("hubs.toolsSub")}
      </p>
    </header>
  );
}
