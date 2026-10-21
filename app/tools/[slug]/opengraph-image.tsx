import {
  renderToolOgImage,
  TOOL_OG_ALT,
  TOOL_OG_CONTENT_TYPE,
  TOOL_OG_SIZE,
} from "@/lib/tools/tool-og-image";

export const alt = TOOL_OG_ALT;
export const size = TOOL_OG_SIZE;
export const contentType = TOOL_OG_CONTENT_TYPE;

type Props = { params: Promise<{ slug: string }> };

export default async function ToolOpenGraphImage({ params }: Props) {
  const { slug } = await params;
  return renderToolOgImage(slug);
}
