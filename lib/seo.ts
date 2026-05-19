import type { Metadata } from "next";

export const SITE = {
  name: "ContentVerse",
  tagline: "Read. Create. Grow.",
  description:
    "ContentVerse is the next-generation creator platform for blogs and content. Read, create and grow with a community of bold writers.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://contentverse.app",
  twitter: "@contentverse",
  ogImage: "/og-default.png",
};

export function buildMetadata(input: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
}): Metadata {
  const title = input.title ? `${input.title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const url = input.path ? `${SITE.url}${input.path}` : SITE.url;
  const image = input.image || SITE.ogImage;
  return {
    metadataBase: new URL(SITE.url),
    title,
    description: input.description || SITE.description,
    keywords: input.keywords,
    authors: input.authors?.map((name) => ({ name })),
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description: input.description || SITE.description,
      url,
      siteName: SITE.name,
      type: input.type || "website",
      publishedTime: input.publishedTime,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description || SITE.description,
      creator: SITE.twitter,
      images: [image],
    },
  };
}

export function articleJsonLd(args: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description,
    image: args.image ? [args.image] : undefined,
    datePublished: args.datePublished,
    dateModified: args.dateModified || args.datePublished,
    author: { "@type": "Person", name: args.authorName },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${SITE.url}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": args.url },
  };
}
