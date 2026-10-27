import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageView } from "@/components/tools/tool-page-view";
import { TOOL_REGISTRY, getToolBySlug, type ToolSlug } from "@/lib/tools/registry";
import { buildLocaleHubMetadata } from "@/lib/i18n/locale-metadata";
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
  return buildLocaleHubMetadata({
    path: meta.path,
    titleEn: meta.title,
    titleHi: meta.title,
    descriptionEn: meta.description,
    descriptionHi: meta.description,
    keywords: meta.keywords,
    noIndex: meta.noIndex,
    bilingualIndex: false,
  });
}

export default async function ToolSlugPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return <ToolPageView slug={tool.slug as ToolSlug} />;
}
