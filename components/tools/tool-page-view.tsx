import { ToolJsonLd } from "@/components/seo/tool-json-ld";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { ToolRenderer } from "@/components/tools/tool-renderer";
import { getToolBySlugOrThrow } from "@/lib/tools/tools-seo";
import type { ToolSlug } from "@/lib/tools/registry";

export function ToolPageView({ slug }: { slug: ToolSlug }) {
  const tool = getToolBySlugOrThrow(slug);
  return (
    <>
      <ToolJsonLd tool={tool} />
      <ToolPageShell slug={slug}>
        <ToolRenderer slug={slug} />
      </ToolPageShell>
    </>
  );
}
