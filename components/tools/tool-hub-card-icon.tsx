"use client";

import { ToolIcon } from "./tool-icon";
import type { ToolSlug } from "@/lib/tools/registry";

export function ToolHubCardIcon({ slug }: { slug: ToolSlug }) {
  return <ToolIcon slug={slug} className="h-5 w-5" />;
}
