import { setToken, getToken, getApiBase, setApiBase } from "../shared/api";
import { DEFAULT_API_BASE } from "../shared/types";

// On install/update, ensure api_base is valid
chrome.runtime.onInstalled.addListener(() => {
  void getApiBase().then((base) => {
    if (!base || !base.startsWith("http")) {
      void setApiBase(DEFAULT_API_BASE);
    }
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "JOBPILOT_SET_TOKEN" && typeof message.token === "string") {
    void setToken(message.token).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message?.type === "JOBPILOT_PING") {
    sendResponse({ ok: true });
    return false;
  }
  if (message?.type === "JOBPILOT_UPDATE_BADGE") {
    const { analysesLeft } = message;
    const text = analysesLeft != null ? String(analysesLeft) : "";
    const color = analysesLeft === 0 ? "#ef4444" : "#10b981";
    void chrome.action.setBadgeText({ text });
    void chrome.action.setBadgeBackgroundColor({ color });
    sendResponse({ ok: true });
    return false;
  }
  return false;
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;
  try {
    const url = new URL(tab.url);
    if (url.pathname.startsWith("/jobpilot/login")) {
      const token = url.searchParams.get("token");
      if (token) void setToken(token);
    }
  } catch {
    /* ignore */
  }

  // Auto-count jobs on job site pages and show in badge
  if (/linkedin\.com|naukri\.com/i.test(tab.url || "") && tab.id) {
    void countJobsOnPage(tab.id);
  }
});

async function countJobsOnPage(tabId: number) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // LinkedIn: count job list items
        const jobCards = document.querySelectorAll(
          ".jobs-search-results__list-item, .scaffold-layout__list-item, [class*='job-card'], .job-card-container, li[class*='jobs-search']"
        );
        if (jobCards.length > 0) return jobCards.length;
        // Fallback: look for "X results" text
        const text = document.body.innerText;
        const match = text.match(/(\d+)\s*results/i);
        if (match) return parseInt(match[1], 10);
        return 0;
      },
    });
    const count = results?.[0]?.result as number || 0;
    if (count > 0) {
      await chrome.action.setBadgeText({ text: String(count) });
      await chrome.action.setBadgeBackgroundColor({ color: "#6366f1" });
    } else {
      await chrome.action.setBadgeText({ text: "" });
    }
  } catch {
    /* ignore */
  }
}
