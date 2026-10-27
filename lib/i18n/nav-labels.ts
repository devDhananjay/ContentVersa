/** Map nav href → dictionary keys for label (+ optional description). */
export const NAV_ITEM_I18N: Record<
  string,
  { label: string; description?: string }
> = {
  "/guides": { label: "nav.indiaGuides", description: "nav.indiaGuidesDesc" },
  "/blogs": { label: "nav.articles", description: "nav.articlesDesc" },
  "/news": { label: "nav.liveNews", description: "nav.liveNewsDesc" },
  "/results": { label: "nav.examResults", description: "nav.examResultsDesc" },
  "/categories": { label: "nav.categories", description: "nav.categoriesDesc" },
  "/sports": { label: "nav.sports", description: "nav.sportsDesc" },
  "/finance": { label: "nav.finance", description: "nav.financeDesc" },
  "/trending": { label: "nav.trending", description: "nav.trendingDesc" },
  "/bookmarks": { label: "nav.bookmarks", description: "nav.bookmarksDesc" },
  "/site-map": { label: "nav.siteMap", description: "nav.siteMapDesc" },
  "/guides/money": { label: "nav.moneyGuides", description: "nav.moneyGuidesDesc" },
  "/guides/schemes": {
    label: "nav.schemeGuides",
    description: "nav.schemeGuidesDesc",
  },
  "/cineverse": { label: "nav.cineverse", description: "nav.cineverseDesc" },
  "/goldverse": { label: "nav.goldverse", description: "nav.goldverseDesc" },
  "/moneyverse": { label: "nav.moneyverse", description: "nav.moneyverseDesc" },
  "/tools": { label: "nav.indiaTools", description: "nav.indiaToolsDesc" },
  "/ai": { label: "nav.aiNav", description: "nav.aiNavDesc" },
  "/jobs": { label: "nav.jobs" },
};

export const NAV_GROUP_I18N: Record<string, string> = {
  explore: "nav.explore",
  verse: "nav.more",
};

/** Top-bar short labels (Guides / News / …) */
export const NAV_TOP_I18N: Record<string, string> = {
  "/guides": "nav.guides",
  "/news": "nav.news",
  "/blogs": "nav.articles",
  "/jobs": "nav.jobs",
  "/results": "nav.results",
};
