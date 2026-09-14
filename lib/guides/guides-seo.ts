import { SITE } from "@/lib/seo";
import {
  GUIDE_SECTIONS,
  GUIDES_HUB_PATH,
  guideArticlePath,
  guideSectionPath,
  type GuideArticle,
  type GuideSection,
} from "./registry";
import { TOP_30_GUIDE_PATHS } from "./top-30-topics";

export function guidesHubUrl() {
  return `${SITE.url}${GUIDES_HUB_PATH}`;
}

export function guidesHubJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "India Guides — Trending, Schemes, Money, Jobs, Cricket, AI & Movies",
    description:
      "Free India explainers: FASTag, EMI, SIP, tax, schemes, jobs, cricket, AI, and OTT — plus 30 high-intent topic guides built for search.",
    url: guidesHubUrl(),
    isPartOf: { "@type": "WebSite", name: SITE.searchName, url: SITE.url },
    hasPart: GUIDE_SECTIONS.map((s) => ({
      "@type": "WebPage",
      name: s.shortTitle,
      url: `${SITE.url}${guideSectionPath(s.slug)}`,
      description: s.description,
    })),
  };
}

export function top30GuidesItemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ContentVerse India — 30 high-intent guides",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: TOP_30_GUIDE_PATHS.length,
    itemListElement: TOP_30_GUIDE_PATHS.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      url: `${SITE.url}${item.href}`,
    })),
  };
}

export function guideSectionFaq(section: GuideSection) {
  return [
    {
      q: `What is the ${section.shortTitle} guide format?`,
      a: `Each ${section.shortTitle} page is a finished explainer with eligibility, steps, or key facts — not a placeholder. Always verify schemes and jobs on official portals before applying.`,
    },
    {
      q: "Is this an official government website?",
      a: "No. ContentVerse India is independent. For schemes and jobs, always verify on official .gov.in portals before applying.",
    },
    {
      q: "Are these guides free?",
      a: "Yes. India Guides on ContentVerse India are free to read with no sign-up required.",
    },
  ];
}

export function guideSectionJsonLd(section: GuideSection) {
  const faq = guideSectionFaq(section);
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: section.title,
      description: section.description,
      url: `${SITE.url}${guideSectionPath(section.slug)}`,
      isPartOf: { "@id": `${SITE.url}/#website` },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
}

export function guideArticleJsonLd(article: GuideArticle, section: GuideSection) {
  const url = `${SITE.url}${guideArticlePath(article)}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url,
    dateModified: article.updatedLabel,
    author: { "@type": "Organization", name: SITE.legalName, url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: SITE.searchName,
      url: SITE.url,
    },
    articleSection: section.shortTitle,
    inLanguage: "en-IN",
    keywords: article.keywords.join(", "),
    wordCount: Math.max(400, article.readingMinutes * 180),
    mainEntityOfPage: url,
    isPartOf: {
      "@type": "WebPage",
      name: section.title,
      url: `${SITE.url}${guideSectionPath(section.slug)}`,
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "India Guides",
        item: `${SITE.url}${GUIDES_HUB_PATH}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: section.shortTitle,
        item: `${SITE.url}${guideSectionPath(section.slug)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.shortTitle,
        item: url,
      },
    ],
  };

  const blocks: unknown[] = [articleLd, breadcrumb];
  if (article.faqs?.length) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }
  return blocks;
}
