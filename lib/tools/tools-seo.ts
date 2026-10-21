import { SITE } from "@/lib/seo";
import { isIndexableTool } from "@/lib/seo/crawl-policy";
import { TOOL_REGISTRY, TOOLS_HUB_PATH, type ToolDef } from "./registry";
import { getToolGuide } from "./tool-guides";
import { LOCATION_CATEGORIES, LOCATION_CITIES } from "./places";
import { SHOW_THIRD_PARTY_CREDITS } from "@/lib/site/third-party-credits";

export function toolsHubUrl() {
  return `${SITE.url}${TOOLS_HUB_PATH}`;
}

export function toolPageUrl(slug: string) {
  return `${SITE.url}${TOOLS_HUB_PATH}/${slug}`;
}

export function toolFaq(tool: ToolDef) {
  /** Tool-specific guide FAQs first (better for rich results than generic copy). */
  const guideFaqs = getToolGuide(tool.slug)?.faqs ?? [];
  const specific: { q: string; a: string }[] = [];

  if (tool.slug === "pan-gstin-checker" || tool.slug === "fssai-checker") {
    specific.push({
      q: "Does this verify with the government live?",
      a: "This tool checks format and provides official links only. It does not confirm active registration with government databases.",
    });
  }

  if (tool.slug === "election-info") {
    specific.push(
      {
        q: "Does this tool check my voter status live with ECI?",
        a: "No. It validates EPIC format and helps you open official Election Commission links. Live electoral-roll results appear only after you complete CAPTCHA on electoralsearch.eci.gov.in or other official ECI services.",
      },
      {
        q: "What is the correct EPIC / Voter ID number format in India?",
        a: "Most EPICs are 10 characters: three letters followed by seven digits (for example ABC1234567). Ignore spaces or hyphens. If your older card looks different, still search with the exact printed number on the official ECI portal.",
      },
      {
        q: "How do I search my name in the voter list online?",
        a: "Go to electoralsearch.eci.gov.in, choose Search by EPIC or Search by Details, select your state, enter the required fields, solve CAPTCHA, and submit. You can also use voters.eci.gov.in, the Voter Helpline app, or SMS ECI <EPIC> to 1950.",
      },
      {
        q: "My EPIC format looks correct but ECI shows no record. What next?",
        a: "Confirm the state matches your enrolment, re-check letters vs digits (O vs 0), try Search by Details, or apply for correction / new registration through the Voters’ Services Portal (forms such as Form 6 or Form 8).",
      }
    );
  }

  if (tool.slug === "vehicle-plate-decoder" || tool.slug === "rto-finder") {
    specific.push({
      q: "Can I get vehicle owner details from the number plate?",
      a: "No. Owner details require the official Vahan portal. Our decoder only identifies state and RTO code from the plate format.",
    });
  }

  if (tool.slug.startsWith("nearby-") || tool.slug === "geo-location") {
    specific.push({
      q: "Why do nearby results need location permission?",
      a: "Near me uses your browser GPS. City search uses geocoding instead — no GPS needed.",
    });
  }

  if (
    tool.slug === "merge-pdf" ||
    tool.slug === "split-pdf" ||
    tool.slug === "compress-pdf" ||
    tool.slug === "images-to-pdf"
  ) {
    specific.push(
      {
        q: "Are my PDF files uploaded to ContentVerse India?",
        a: "No. PDF tools run entirely in your browser. Files stay on your device and are not sent to our servers.",
      },
      {
        q: "What is the maximum file size?",
        a: "Each file can be up to 25 MB. Very large or encrypted PDFs may fail — unlock or compress offline first if needed.",
      }
    );
  }

  if (tool.slug === "compress-pdf") {
    specific.push({
      q: "Will compress always make my PDF much smaller?",
      a: "Not always. Already-optimized or scanned image PDFs may shrink only a little. We show before/after size honestly.",
    });
  }

  if (tool.slug === "salary-tax-calculator") {
    specific.push(
      {
        q: "Which financial year does this tax calculator use?",
        a: "FY 2026–27 (AY 2027–28) slab rates under the new default regime (nil up to ₹4 lakh) and the old regime, including standard deduction and Section 87A rebate estimates.",
      },
      {
        q: "Is this an official Income Tax Department calculator?",
        a: "No. It is an independent estimate for planning. Always verify on the Income Tax e-filing portal or with a tax professional before filing returns.",
      }
    );
  }

  if (tool.slug === "rd-calculator") {
    specific.push({
      q: "How is RD maturity different from FD?",
      a: "An RD is funded by monthly deposits; an FD is usually a lump sum. This calculator compounds RD instalments to estimate maturity — your bank’s day-count rules may differ slightly.",
    });
  }

  if (tool.slug === "weather") {
    specific.push({
      q: "Which cities does the weather tool cover?",
      a: "Any city or town you can search by name in India. Results show current conditions plus a short multi-day outlook for planning.",
    });
  }

  if (tool.slug === "pnr-status" || tool.slug === "train-running-status") {
    specific.push({
      q: "Is this an official IRCTC tool?",
      a: SHOW_THIRD_PARTY_CREDITS
        ? "No. ContentVerse India helps you validate input and open trusted enquiry sites (ConfirmTkt, RailYatri, NTES). Always reconfirm on IRCTC before travel."
        : "No. ContentVerse India helps you validate input and open trusted railway enquiry sites. Always reconfirm on the official railway site before travel.",
    });
  }

  if (tool.slug === "english-hindi-translator") {
    specific.push({
      q: "Is the translation 100% accurate?",
      a: "It is machine translation for everyday use. For legal, medical, or official documents, use a certified human translator.",
    });
  }

  if (tool.slug === "silver-rate") {
    specific.push({
      q: "Is this the jeweller retail silver rate?",
      a: "We show a spot-based India estimate (international silver × USD/INR). Local jewellers add making charges and GST — confirm before buying.",
    });
  }

  const closing = [
    {
      q: `Is the ${tool.shortTitle} free on ContentVerse India?`,
      a: "Yes. All India utility tools on ContentVerse India are free to use with no sign-up required.",
    },
    {
      q: "Is this an official government website?",
      a: "No. ContentVerse India is an independent platform. We use public datasets and open APIs. For official records, use government portals like Parivahan, GST, FoSCoS, or ECI.",
    },
  ];

  const out: { q: string; a: string }[] = [];
  const seen = new Set<string>();
  for (const item of [...guideFaqs, ...specific, ...closing]) {
    const key = item.q.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function toolWebAppJsonLd(tool: ToolDef) {
  const guide = getToolGuide(tool.slug);
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.shortTitle,
    alternateName: tool.title,
    description: tool.description,
    url: toolPageUrl(tool.slug),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    inLanguage: "en-IN",
    ...(guide?.sections?.length
      ? {
          featureList: guide.sections
            .slice(0, 6)
            .map((s) => s.heading)
            .join(", "),
        }
      : {}),
  };
}

/** HowTo JSON-LD from the first guide sections — improves how-to rich results. */
export function toolHowToJsonLd(tool: ToolDef) {
  const guide = getToolGuide(tool.slug);
  if (!guide?.sections?.length) return null;
  const steps = guide.sections.slice(0, 6).map((section, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: section.heading,
    text: section.paragraphs[0] || section.heading,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.shortTitle}`,
    description: guide.intro.slice(0, 300),
    url: toolPageUrl(tool.slug),
    totalTime: "PT5M",
    tool: {
      "@type": "HowToTool",
      name: tool.shortTitle,
    },
    step: steps,
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
      "IFSC, pincode, weather, currency, QR/barcode, PDF merge/split/compress, FSSAI format, holidays, nearby places, RTO, fuel, EMI, SIP, and more.",
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
    noIndex: !isIndexableTool(tool.slug),
  };
}

export function getToolBySlugOrThrow(slug: string): ToolDef {
  const tool = TOOL_REGISTRY.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}

export function locationPagePaths() {
  // Kept for internal linking / static params. These URLs are noindex and
  // intentionally omitted from sitemap.xml (thin city×category templates).
  return LOCATION_CITIES.flatMap((city) =>
    LOCATION_CATEGORIES.map((category) => ({
      path: `${TOOLS_HUB_PATH}/locations/${city.slug}/${category}`,
      changeFrequency: "weekly" as const,
      priority: 0.82,
    }))
  );
}
