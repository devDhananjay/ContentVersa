import { SITE } from "@/lib/seo";
import { getToolBySlug, TOOLS_HUB_PATH, type ToolDef } from "./registry";

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
      a: "No. ContentVerse is an independent platform. We use public datasets and open APIs. For official records, use government portals like Parivahan, GST, or your bank.",
    },
  ];

  if (tool.slug === "pan-gstin-checker") {
    base.push({
      q: "Does this verify PAN or GSTIN with the government?",
      a: "This tool checks format and checksum only. It does not confirm active registration with CBDT or GSTN.",
    });
  }

  if (tool.slug === "vehicle-plate-decoder" || tool.slug === "rto-finder") {
    base.push({
      q: "Can I get vehicle owner details from the number plate?",
      a: "No. Owner details require the official Vahan portal. Our decoder only identifies state and RTO code from the plate format.",
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
      "IFSC finder, pincode lookup, RTO code search with address, PAN/GSTIN checker, EMI & SIP calculators, fuel prices, and vehicle plate decoder.",
    url: toolsHubUrl(),
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "IFSC Finder",
          url: toolPageUrl("ifsc-finder"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Pincode Finder",
          url: toolPageUrl("pincode-finder"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Vehicle RC Check",
          url: toolPageUrl("vehicle-rc"),
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "e-Challan Check",
          url: toolPageUrl("echallan"),
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "FASTag Check",
          url: toolPageUrl("fastag"),
        },
        {
          "@type": "ListItem",
          position: 6,
          name: "RTO Finder",
          url: toolPageUrl("rto-finder"),
        },
        {
          "@type": "ListItem",
          position: 7,
          name: "Vehicle Plate Decoder",
          url: toolPageUrl("vehicle-plate-decoder"),
        },
        {
          "@type": "ListItem",
          position: 8,
          name: "PAN / GSTIN Checker",
          url: toolPageUrl("pan-gstin-checker"),
        },
        {
          "@type": "ListItem",
          position: 9,
          name: "EMI Calculator",
          url: toolPageUrl("emi-calculator"),
        },
        {
          "@type": "ListItem",
          position: 10,
          name: "SIP Calculator",
          url: toolPageUrl("sip-calculator"),
        },
        {
          "@type": "ListItem",
          position: 11,
          name: "Fuel Price",
          url: toolPageUrl("fuel-price"),
        },
      ],
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
  const tool = getToolBySlug(slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}
