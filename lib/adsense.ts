export function normalizeAdSenseClientId(raw?: string | null): string | null {
  const value = raw?.trim();
  if (!value) return null;

  const match = value.match(/(?:ca-)?pub-(\d+)/i);
  if (!match?.[1]) return null;
  return `ca-pub-${match[1]}`;
}
