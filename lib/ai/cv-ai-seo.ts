import { SITE } from "@/lib/seo";
import { CV_AI_FAQS, CV_AI_PATH, CV_AI_MODES } from "@/lib/ai/cv-ai-modes";

export function cvAiWebPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ContentVerse India AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${SITE.url}${CV_AI_PATH}`,
    description:
      "ContentVerse India AI — ask anything, summarise articles, explain simply, compare options, generate resumes, calculate finance, analyse PDFs, bank statements and screenshots.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    featureList: CV_AI_MODES.map((m) => m.title),
  };
}

export function cvAiFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CV_AI_FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function cvAiBreadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "ContentVerse India AI",
        item: `${SITE.url}${CV_AI_PATH}`,
      },
    ],
  };
}
