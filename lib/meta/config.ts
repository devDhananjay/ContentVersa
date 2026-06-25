import { getAppUrl } from "@/lib/app-url";

export const META_GRAPH_VERSION = "v21.0";
export const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;
export const META_OAUTH_SCOPES = [
  "pages_manage_posts",
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
].join(",");

export function isMetaAppConfigured(): boolean {
  return Boolean(process.env.META_APP_ID?.trim() && process.env.META_APP_SECRET?.trim());
}

export function getMetaAppId(): string {
  return process.env.META_APP_ID?.trim() ?? "";
}

export function getMetaAppSecret(): string {
  return process.env.META_APP_SECRET?.trim() ?? "";
}

export function getMetaRedirectUri(): string {
  return `${getAppUrl()}/api/admin/meta/callback`;
}
