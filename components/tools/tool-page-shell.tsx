import Link from "next/link";
import type { ToolSlug } from "@/lib/tools/registry";
import { getToolBySlugOrThrow, toolFaq } from "@/lib/tools/tools-seo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolIcon } from "./tool-icon";

export function ToolPageShell({
  slug,
  children,
}: {
  slug: ToolSlug;
  children: React.ReactNode;
}) {
  const tool = getToolBySlugOrThrow(slug);
  const faq = toolFaq(tool);

  return (
    <div className="container space-y-10 py-8 md:py-10">
      <header className="max-w-3xl space-y-3">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <ToolIcon slug={slug} className="h-3.5 w-3.5" />
          India Tools
          {tool.badge ? (
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {tool.badge}
            </Badge>
          ) : null}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {tool.shortTitle}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base leading-relaxed">
          {tool.description}
        </p>
        <p className="text-xs text-muted-foreground">
          Part of{" "}
          <Link href="/tools" className="text-primary hover:underline">
            ContentVerse India Tools
          </Link>{" "}
          — free daily-use checkers for Indian users.
        </p>
      </header>

      {children}

      <section className="max-w-3xl space-y-4">
        <h2 className="font-display text-xl font-semibold">Frequently asked questions</h2>
        <div className="space-y-3">
          {faq.map((item) => (
            <Card key={item.q}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.a}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
