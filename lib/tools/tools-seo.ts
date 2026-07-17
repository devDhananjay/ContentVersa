import { SITE } from "@/lib/seo";
import { TOOL_REGISTRY, TOOLS_HUB_PATH, type ToolDef } from "./registry";
import { LOCATION_CATEGORIES, LOCATION_CITIES } from "./places";

export function toolsHubUrl() {
  return `${SITE.url}${TOOLS_HUB_PATH}`;
}

export function toolPageUrl(slug: string) {
  return `${SITE.url}${TOOLS_HUB_PATH}/${slug}`;
}

export function toolFaq(tool: ToolDef) {
  const base = [
    {
      q: `Is the ${tool.shortTitle} free on ContentVerse?`,
      a: "Yes. All India utility tools on ContentVerse are free to use with no sign-up required.",
    },
    {
      q: "Is this an official government website?",
      a: "No. ContentVerse is an independent platform. We use public datasets and open APIs. For official records, use government portals like Parivahan, GST, FoSCoS, or ECI.",
    },
  ];

  if (tool.slug === "pan-gstin-checker" || tool.slug === "fssai-checker" || tool.slug === "election-info") {
    base.push({
      q: "Does this verify with the government live?",
      a: "This tool checks format and provides official links only. It does not confirm active registration with government databases.",
    });
  }

  if (tool.slug === "vehicle-plate-decoder" || tool.slug === "rto-finder") {
    base.push({
      q: "Can I get vehicle owner details from the number plate?",
      a: "No. Owner details require the official Vahan portal. Our decoder only identifies state and RTO code from the plate format.",
    });
  }

  if (tool.slug.startsWith("nearby-") || tool.slug === "geo-location") {
    base.push({
      q: "Why do nearby results need location permission?",
      a: "Near me uses your browser GPS. City search uses geocoding instead — no GPS needed.",
    });
  }

  return base;
}

export function toolWebAppJsonLd(tool: ToolDef) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.shortTitle,
    description: tool.description,
    url: toolPageUrl(tool.slug),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
}

export function toolFaqJsonLd(tool: ToolDef) {
  const faq = toolFaq(tool);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function toolBreadcrumbJsonLd(tool: ToolDef) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "India Tools", item: toolsHubUrl() },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.shortTitle,
        item: toolPageUrl(tool.slug),
      },
    ],
  };
}

export function toolsHubJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free India Utility Tools",
    description:
      "IFSC, pincode, weather, currency, QR/barcode, FSSAI format, holidays, nearby places, RTO, fuel, EMI, SIP, and more.",
    url: toolsHubUrl(),
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: TOOL_REGISTRY.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: tool.shortTitle,
        url: toolPageUrl(tool.slug),
      })),
    },
  };
}

export function getToolMetadata(tool: ToolDef) {
  return {
    title: tool.title,
    description: tool.description,
    path: `${TOOLS_HUB_PATH}/${tool.slug}`,
    keywords: tool.keywords,
  };
}

export function getToolBySlugOrThrow(slug: string): ToolDef {
  const tool = TOOL_REGISTRY.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}

export function locationPagePaths() {
  return LOCATION_CITIES.flatMap((city) =>
    LOCATION_CATEGORIES.map((category) => ({
      path: `${TOOLS_HUB_PATH}/locations/${city.slug}/${category}`,
      changeFrequency: "weekly" as const,
      priority: 0.82,
    }))
  );
}
