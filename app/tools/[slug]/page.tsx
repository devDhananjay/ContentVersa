import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageView } from "@/components/tools/tool-page-view";
import { TOOL_REGISTRY, getToolBySlug, type ToolSlug } from "@/lib/tools/registry";
import { buildMetadata } from "@/lib/seo";
import { getToolMetadata } from "@/lib/tools/tools-seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOOL_REGISTRY.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  const meta = getToolMetadata(tool);
  return buildMetadata(meta);
}

export default async function ToolSlugPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return <ToolPageView slug={tool.slug as ToolSlug} />;
}
