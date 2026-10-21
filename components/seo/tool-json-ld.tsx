import {
  toolBreadcrumbJsonLd,
  toolFaqJsonLd,
  toolHowToJsonLd,
  toolWebAppJsonLd,
} from "@/lib/tools/tools-seo";
import type { ToolDef } from "@/lib/tools/registry";

export function ToolJsonLd({ tool }: { tool: ToolDef }) {
  const blocks = [
    toolWebAppJsonLd(tool),
    toolFaqJsonLd(tool),
    toolBreadcrumbJsonLd(tool),
    toolHowToJsonLd(tool),
  ].filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
