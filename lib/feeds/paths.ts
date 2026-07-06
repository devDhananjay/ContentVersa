import { displaySymbol } from "@/lib/finance/transformers";

export function feedItemPath(category: string, id: string): string {
  if (category === "finance") {
    return `/finance/stock/${displaySymbol(decodeURIComponent(id))}`;
  }
  if (category === "movies") {
    return `/cineverse/movie/${encodeURIComponent(id)}`;
  }
  return `/discover/${category}/${encodeURIComponent(id)}`;
}
