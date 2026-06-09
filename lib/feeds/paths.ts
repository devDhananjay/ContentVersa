export function feedItemPath(category: string, id: string): string {
  return `/discover/${category}/${encodeURIComponent(id)}`;
}
