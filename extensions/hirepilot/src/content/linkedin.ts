import type { ScrapedJob } from "../shared/types";

function textOf(el: Element | null | undefined): string {
  return (el?.textContent || "").replace(/\s+/g, " ").trim();
}

export function scrapeLinkedInJob(): ScrapedJob | null {
  const selTitle = [
    ".job-details-jobs-unified-top-card__job-title",
    ".jobs-unified-top-card__job-title",
    "h1.t-24",
    ".jobs-search__job-details h1",
    ".jobs-details h1",
    "h1",
  ];
  let title = "";
  for (const s of selTitle) { title = textOf(document.querySelector(s)); if (title) break; }

  const selCompany = [
    ".job-details-jobs-unified-top-card__company-name a",
    ".job-details-jobs-unified-top-card__company-name",
    ".jobs-unified-top-card__company-name a",
    ".jobs-unified-top-card__company-name",
  ];
  let company: string | null = null;
  for (const s of selCompany) { company = textOf(document.querySelector(s)) || null; if (company) break; }

  const selJd = [
    "#job-details",
    ".jobs-description__content",
    ".jobs-box__html-content",
    ".jobs-description-content__text",
    "[class*='jobs-description']",
    ".jobs-search__job-details--wrapper [class*='description']",
    "article [class*='description']",
  ];
  let jd = "";
  for (const s of selJd) { jd = textOf(document.querySelector(s)); if (jd && jd.length > 40) break; }

  if (!title || jd.length < 40) return null;

  return {
    url: location.href.split("?")[0],
    source: "LINKEDIN",
    title,
    company,
    jdText: jd.slice(0, 40000),
  };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "JOBPILOT_SCRAPE") {
    sendResponse({ job: scrapeLinkedInJob() });
    return false;
  }
  return false;
});
