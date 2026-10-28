export type YmylKind = "finance" | "health" | "tax" | "schemes" | "general";

/** Map blog category slug → YMYL disclaimer kind (null = skip banner). */
export function ymylKindForBlogCategory(categorySlug: string): YmylKind | null {
  const c = categorySlug.toLowerCase();
  if (c === "finance" || c === "money" || c === "investing") return "finance";
  if (c === "health" || c === "wellness" || c === "medical") return "health";
  if (c === "tax" || c === "gst") return "tax";
  return null;
}
