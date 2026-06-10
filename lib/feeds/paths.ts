import { displaySymbol } from "@/lib/finance/transformers";

export function feedItemPath(category: string, id: string): string {
  if (category === "finance") {
    return `/finance/stock/${displaySymbol(decodeURIComponent(id))}`;
  }
  return `/discover/${category}/${encodeURIComponent(id)}`;
}
