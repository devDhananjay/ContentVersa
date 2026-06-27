import { getAppUrl } from "@/lib/app-url";

function layout(content: string, footerExtra?: string) {
  const site = getAppUrl();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:system-ui,-apple-system,sans-serif;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <tr><td style="padding-bottom:24px;">
      <a href="${site}" style="font-size:20px;font-weight:800;color:#fff;text-decoration:none;">ContentVerse</a>
      <span style="color:#a855f7;font-size:13px;display:block;margin-top:4px;">Read. Create. Grow.</span>
    </td></tr>
    <tr><td style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:28px 24px;">
      ${content}
    </td></tr>
    <tr><td style="padding-top:20px;font-size:12px;color:#71717a;line-height:1.6;text-align:center;">
      ${footerExtra || ""}
      <p style="margin:8px 0 0;"><a href="${site}" style="color:#a855f7;">contentverse.co.in</a></p>
    </td></tr>
  </table>
</body></html>`;
}

function btn(href: string, label: string) {
  return `<p style="margin:24px 0 0;text-align:center;">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#a855f7);color:#fff;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:10px;">${label}</a>
  </p>`;
}

export function newsletterWelcomeEmail(unsubscribeUrl: string) {
  const site = getAppUrl();
  const html = layout(
    `<h1 style="margin:0 0 12px;font-size:22px;color:#fff;">Welcome to The Verse</h1>
    <p style="margin:0 0 16px;line-height:1.65;color:#d4d4d8;">You're subscribed to the ContentVerse newsletter. Every Friday we'll send top reads, creator spotlights, and what's trending.</p>
    <p style="margin:0;line-height:1.65;color:#a1a1aa;font-size:14px;">Meanwhile, explore the latest stories on the site.</p>
    ${btn(site + "/blogs", "Browse articles")}`,
    `<p><a href="${unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a></p>`
  );
  return {
    subject: "Welcome to ContentVerse — you're subscribed",
    html,
  };
}

export function weeklyDigestEmail(opts: {
  articles: {
    title: string;
    slug: string;
    excerpt?: string | null;
    reason?: "followed" | "unread" | "trending";
  }[];
  unsubscribeUrl: string;
}) {
  const site = getAppUrl();
  const reasonLabel = (reason?: string) => {
    if (reason === "followed") return "From a category you follow";
    if (reason === "unread") return "Unread pick for you";
    return "Trending this week";
  };
  const list = opts.articles
    .map(
      (a) =>
        `<li style="margin-bottom:16px;">
          <span style="display:block;font-size:11px;color:#a855f7;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${reasonLabel(a.reason)}</span>
          <a href="${site}/blog/${a.slug}" style="color:#fff;font-weight:600;text-decoration:none;font-size:16px;">${escapeHtml(a.title)}</a>
          ${a.excerpt ? `<p style="margin:6px 0 0;color:#a1a1aa;font-size:14px;line-height:1.5;">${escapeHtml(a.excerpt.slice(0, 120))}${a.excerpt.length > 120 ? "…" : ""}</p>` : ""}
        </li>`
    )
    .join("");

  const html = layout(
    `<h1 style="margin:0 0 8px;font-size:22px;color:#fff;">Your weekly digest</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;font-size:14px;">Trending + unread from categories you follow</p>
    <ul style="margin:0;padding:0;list-style:none;">${list}</ul>
    ${btn(site + "/blogs", "See all articles")}`,
    `<p><a href="${opts.unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a></p>`
  );
  return { subject: "Your weekly ContentVerse digest", html };
}

export function trendingArticleEmail(opts: {
  title: string;
  slug: string;
  excerpt?: string | null;
  unsubscribeUrl: string;
}) {
  const site = getAppUrl();
  const html = layout(
    `<h1 style="margin:0 0 12px;font-size:22px;color:#fff;">🔥 Trending today</h1>
    <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#fff;">${escapeHtml(opts.title)}</p>
    ${opts.excerpt ? `<p style="margin:0 0 16px;color:#a1a1aa;line-height:1.6;">${escapeHtml(opts.excerpt.slice(0, 200))}</p>` : ""}
    ${btn(`${site}/blog/${opts.slug}`, "Read article")}`,
    `<p><a href="${opts.unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a></p>`
  );
  return { subject: `Trending: ${opts.title.slice(0, 60)}`, html };
}

export function stockWatchlistDigestEmail(opts: {
  phase: "open" | "close";
  items: { title: string; message: string; link?: string | null }[];
  unsubscribeUrl?: string;
}) {
  const site = getAppUrl();
  const heading =
    opts.phase === "open"
      ? "Market open — your watchlist"
      : "Market close — your watchlist";
  const subject =
    opts.phase === "open"
      ? "Your watchlist: market open update"
      : "Your watchlist: market close update";

  const list = opts.items
    .map((item) => {
      const href = item.link?.startsWith("http")
        ? item.link
        : item.link
          ? `${site}${item.link}`
          : `${site}/finance`;
      return `<li style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #27272a;">
          <a href="${href}" style="color:#fff;font-weight:600;text-decoration:none;font-size:16px;">${escapeHtml(item.title)}</a>
          <p style="margin:6px 0 0;color:#a1a1aa;font-size:14px;line-height:1.5;">${escapeHtml(item.message)}</p>
        </li>`;
    })
    .join("");

  const html = layout(
    `<h1 style="margin:0 0 8px;font-size:22px;color:#fff;">${heading}</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;font-size:14px;">${opts.items.length} stock${opts.items.length === 1 ? "" : "s"} on your watchlist</p>
    <ul style="margin:0;padding:0;list-style:none;">${list}</ul>
    ${btn(`${site}/finance`, "View watchlist")}`,
    opts.unsubscribeUrl
      ? `<p><a href="${opts.unsubscribeUrl}" style="color:#71717a;">Unsubscribe from emails</a></p>`
      : ""
  );

  return { subject, html };
}

export function notificationEmail(opts: {
  title: string;
  message: string;
  link?: string | null;
  unsubscribeUrl?: string;
}) {
  const site = getAppUrl();
  const href = opts.link?.startsWith("http") ? opts.link : opts.link ? `${site}${opts.link}` : site;
  const html = layout(
    `<h1 style="margin:0 0 12px;font-size:20px;color:#fff;">${escapeHtml(opts.title)}</h1>
    <p style="margin:0;line-height:1.65;color:#d4d4d8;">${escapeHtml(opts.message)}</p>
    ${opts.link ? btn(href, "Open in ContentVerse") : ""}`,
    opts.unsubscribeUrl
      ? `<p><a href="${opts.unsubscribeUrl}" style="color:#71717a;">Unsubscribe from emails</a></p>`
      : ""
  );
  return { subject: opts.title, html };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
