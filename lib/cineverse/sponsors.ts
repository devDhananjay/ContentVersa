export type CineverseSponsor = {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  partner: string;
};

export function getCineverseSponsor(): CineverseSponsor | null {
  const title = process.env.CINEVERSE_SPONSOR_TITLE?.trim();
  const href = process.env.CINEVERSE_SPONSOR_URL?.trim();
  if (!title || !href) {
    return {
      title: "Stream smarter this weekend",
      subtitle: "Compare plans on Prime Video & Netflix — pick what fits your watchlist.",
      cta: "Explore OTT deals",
      href: "https://www.amazon.in/prime",
      partner: "Sponsored",
    };
  }
  return {
    title,
    subtitle:
      process.env.CINEVERSE_SPONSOR_SUBTITLE?.trim() ??
      "Limited-time OTT promotion for ContentVerse readers.",
    cta: process.env.CINEVERSE_SPONSOR_CTA?.trim() ?? "Learn more",
    href,
    partner: process.env.CINEVERSE_SPONSOR_PARTNER?.trim() ?? "Sponsored",
  };
}
