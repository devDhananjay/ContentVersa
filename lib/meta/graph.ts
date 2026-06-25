import { META_GRAPH_BASE } from "@/lib/meta/config";
import type { MetaIntegration } from "@/lib/meta/store";

type GraphError = {
  error?: { message?: string; type?: string; code?: number };
};

async function graphRequest<T>(
  path: string,
  params: Record<string, string> = {},
  method: "GET" | "POST" = "GET"
): Promise<T> {
  const url = new URL(`${META_GRAPH_BASE}${path}`);

  if (method === "GET") {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = (await res.json()) as T & GraphError;
    if (!res.ok || data.error) {
      throw new Error(data.error?.message ?? `Meta Graph API error (${res.status})`);
    }
    return data;
  }

  const body = new URLSearchParams(params);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const data = (await res.json()) as T & GraphError;
  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `Meta Graph API error (${res.status})`);
  }
  return data;
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const appId = process.env.META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();
  if (!appId || !appSecret) throw new Error("META_APP_ID and META_APP_SECRET are required");

  const url = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = (await res.json()) as { access_token?: string; error?: { message?: string } };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error?.message ?? "Failed to exchange Meta OAuth code");
  }
  return data.access_token;
}

export async function exchangeForLongLivedUserToken(shortToken: string) {
  const appId = process.env.META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();
  if (!appId || !appSecret) return shortToken;

  const data = await graphRequest<{ access_token: string }>("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken,
  });
  return data.access_token;
}

type MetaPage = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
};

export async function fetchUserPages(userToken: string): Promise<MetaPage[]> {
  const data = await graphRequest<{ data: MetaPage[] }>("/me/accounts", {
    access_token: userToken,
    fields: "id,name,access_token,instagram_business_account",
  });
  return data.data ?? [];
}

export async function fetchInstagramProfile(igUserId: string, accessToken: string) {
  return graphRequest<{ username?: string; name?: string }>(`/${igUserId}`, {
    access_token: accessToken,
    fields: "username,name",
  });
}

export async function resolveInstagramForPage(
  pageId: string,
  pageAccessToken: string
): Promise<{ igUserId: string | null; igUsername: string | null }> {
  try {
    const page = await graphRequest<{ instagram_business_account?: { id: string } }>(
      `/${pageId}`,
      {
        access_token: pageAccessToken,
        fields: "instagram_business_account",
      }
    );
    const igUserId = page.instagram_business_account?.id ?? null;
    if (!igUserId) return { igUserId: null, igUsername: null };

    const ig = await fetchInstagramProfile(igUserId, pageAccessToken);
    return { igUserId, igUsername: ig.username ?? ig.name ?? null };
  } catch {
    return { igUserId: null, igUsername: null };
  }
}

export async function publishFacebookLinkPost(
  integration: MetaIntegration,
  input: { message: string; link: string }
) {
  const data = await graphRequest<{ id: string }>(`/${integration.pageId}/feed`, {
    access_token: integration.pageAccessToken,
    message: input.message,
    link: input.link,
  });
  return { id: data.id, permalink: `https://www.facebook.com/${data.id}` };
}

export async function publishFacebookPhotoPost(
  integration: MetaIntegration,
  input: { message: string; imageUrl: string; link?: string }
) {
  const params: Record<string, string> = {
    access_token: integration.pageAccessToken,
    url: input.imageUrl,
    caption: input.message,
  };
  if (input.link) params.link = input.link;

  const data = await graphRequest<{ id: string; post_id?: string }>(
    `/${integration.pageId}/photos`,
    params,
    "POST"
  );
  const postId = data.post_id ?? data.id;
  return { id: postId, permalink: `https://www.facebook.com/${postId}` };
}

export async function publishInstagramImagePost(
  integration: MetaIntegration,
  input: { imageUrl: string; caption: string }
) {
  if (!integration.igUserId) {
    throw new Error("No Instagram Business account linked to this Facebook Page");
  }

  const container = await graphRequest<{ id: string }>(
    `/${integration.igUserId}/media`,
    {
      access_token: integration.pageAccessToken,
      image_url: input.imageUrl,
      caption: input.caption,
    },
    "POST"
  );

  const published = await graphRequest<{ id: string }>(
    `/${integration.igUserId}/media_publish`,
    {
      access_token: integration.pageAccessToken,
      creation_id: container.id,
    },
    "POST"
  );

  return {
    id: published.id,
    permalink: `https://www.instagram.com/p/${published.id}/`,
  };
}

export async function publishInstagramReel(
  integration: MetaIntegration,
  input: { videoUrl: string; caption: string }
) {
  if (!integration.igUserId) {
    throw new Error("No Instagram Business account linked to this Facebook Page");
  }

  const container = await graphRequest<{ id: string }>(
    `/${integration.igUserId}/media`,
    {
      access_token: integration.pageAccessToken,
      media_type: "REELS",
      video_url: input.videoUrl,
      caption: input.caption,
    },
    "POST"
  );

  const published = await graphRequest<{ id: string }>(
    `/${integration.igUserId}/media_publish`,
    {
      access_token: integration.pageAccessToken,
      creation_id: container.id,
    },
    "POST"
  );

  return {
    id: published.id,
    permalink: `https://www.instagram.com/reel/${published.id}/`,
  };
}
