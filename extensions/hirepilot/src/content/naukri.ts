import type { ScrapedJob } from "../shared/types";

function textOf(el: Element | null | undefined): string {
  return (el?.textContent || "").replace(/\s+/g, " ").trim();
}

export function scrapeNaukriJob(): ScrapedJob | null {
  const title =
    textOf(document.querySelector(".jd-header-title")) ||
    textOf(document.querySelector("h1.styles_jd-header-title__")) ||
    textOf(document.querySelector("h1"));

  const company =
    textOf(document.querySelector(".jd-header-comp-name a")) ||
    textOf(document.querySelector(".styles_jd-header-comp-name__ a")) ||
    textOf(document.querySelector(".jd-header-comp-name")) ||
    null;

  const jd =
    textOf(document.querySelector(".dang-inner-html")) ||
    textOf(document.querySelector(".styles_JDC__dang-inner-html__")) ||
    textOf(document.querySelector(".job-desc")) ||
    textOf(document.querySelector("#jobDescription"));

  if (!title || jd.length < 40) return null;

  return {
    url: location.href.split("?")[0],
    source: "NAUKRI",
    title,
    company,
    jdText: jd.slice(0, 40000),
  };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "JOBPILOT_SCRAPE") {
    sendResponse({ job: scrapeNaukriJob() });
    return false;
  }
  return false;
});
