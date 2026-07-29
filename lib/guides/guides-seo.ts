import { SITE } from "@/lib/seo";
import {
  GUIDE_SECTIONS,
  GUIDES_HUB_PATH,
  guideArticlePath,
  guideSectionPath,
  type GuideArticle,
  type GuideSection,
} from "./registry";

export function guidesHubUrl() {
  return `${SITE.url}${GUIDES_HUB_PATH}`;
}

export function guidesHubJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "India Guides — Trending, Schemes, Jobs, Cricket, AI & Movies",
    description:
      "Free India explainers: why topics trend, govt schemes, job notifications, cricket match guides, AI how-tos, and OTT watch guides.",
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

export function guideSectionFaq(section: GuideSection) {
  return [
    {
      q: `What is the ${section.shortTitle} guide format?`,
      a: `We use the template “${section.template}” so each page answers the search intent clearly with eligibility, steps, or key facts.`,
    },
    {
      q: "Is this an official government website?",
      a: "No. ContentVerse is independent. For schemes and jobs, always verify on official .gov.in portals before applying.",
    },
    {
      q: "Are these guides free?",
      a: "Yes. India Guides on ContentVerse are free to read with no sign-up required.",
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
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `${SITE.url}${guideArticlePath(article)}`,
    dateModified: article.updatedLabel,
    author: { "@type": "Organization", name: SITE.legalName, url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: SITE.searchName,
      url: SITE.url,
    },
    articleSection: section.shortTitle,
    inLanguage: "en-IN",
    isPartOf: {
      "@type": "WebPage",
      name: section.title,
      url: `${SITE.url}${guideSectionPath(section.slug)}`,
    },
  };
}
