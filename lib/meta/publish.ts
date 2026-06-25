import { BlogStatus, ReelStatus } from "@prisma/client";
import { getAppUrl } from "@/lib/app-url";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  publishFacebookLinkPost,
  publishFacebookPhotoPost,
  publishInstagramImagePost,
  publishInstagramReel,
} from "@/lib/meta/graph";
import { getMetaIntegration } from "@/lib/meta/store";

export type MetaPublishPlatform = "facebook" | "instagram";
export type MetaPublishContentType = "blog" | "reel";

export type MetaPublishInput = {
  contentType: MetaPublishContentType;
  contentId: string;
  platforms: MetaPublishPlatform[];
  customMessage?: string;
  publishedBy: string;
};

export type MetaPublishResult = {
  platform: MetaPublishPlatform;
  success: boolean;
  externalId?: string;
  permalink?: string;
  error?: string;
};

function toPublicUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  const value = path.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = getAppUrl();
  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function logPublish(entry: {
  contentType: string;
  contentId: string;
  platform: string;
  externalId?: string;
  permalink?: string;
  status: string;
  error?: string;
  publishedBy: string;
}) {
  if (!isDatabaseConfigured()) return;
  await prisma.metaPublishLog.create({ data: entry });
}

export async function publishToMeta(input: MetaPublishInput): Promise<MetaPublishResult[]> {
  const integration = await getMetaIntegration();
  if (!integration) {
    throw new Error(
      "Meta is not connected. Connect your Facebook Page in Admin → Meta Publishing."
    );
  }

  const platforms = [...new Set(input.platforms)];
  if (!platforms.length) throw new Error("Select at least one platform");

  if (input.contentType === "blog") {
    return publishBlog(integration, input, platforms);
  }
  return publishReel(integration, input, platforms);
}

async function publishBlog(
  integration: NonNullable<Awaited<ReturnType<typeof getMetaIntegration>>>,
  input: MetaPublishInput,
  platforms: MetaPublishPlatform[]
): Promise<MetaPublishResult[]> {
  const blog = await prisma.blog.findUnique({
    where: { id: input.contentId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      ogImage: true,
      status: true,
    },
  });

  if (!blog || blog.status !== BlogStatus.PUBLISHED) {
    throw new Error("Blog not found or not published");
  }

  const link = `${getAppUrl()}/blog/${blog.slug}`;
  const summary = blog.excerpt?.trim() || stripHtml(blog.content).slice(0, 280);
  const message =
    input.customMessage?.trim() ||
    `${blog.title}\n\n${summary}\n\nRead more: ${link}`;
  const imageUrl = toPublicUrl(blog.ogImage || blog.coverImage);

  const results: MetaPublishResult[] = [];

  for (const platform of platforms) {
    try {
      if (platform === "facebook") {
        const result = imageUrl
          ? await publishFacebookPhotoPost(integration, { message, imageUrl, link })
          : await publishFacebookLinkPost(integration, { message, link });
        results.push({ platform, success: true, ...result });
        await logPublish({
          contentType: "BLOG",
          contentId: blog.id,
          platform: "FACEBOOK",
          externalId: result.id,
          permalink: result.permalink,
          status: "SUCCESS",
          publishedBy: input.publishedBy,
        });
      } else {
        if (!imageUrl) {
          throw new Error("Instagram requires a cover image on the blog");
        }
        const caption = `${blog.title}\n\n${summary}\n\n${link}`;
        const result = await publishInstagramImagePost(integration, {
          imageUrl,
          caption,
        });
        results.push({ platform, success: true, ...result });
        await logPublish({
          contentType: "BLOG",
          contentId: blog.id,
          platform: "INSTAGRAM",
          externalId: result.id,
          permalink: result.permalink,
          status: "SUCCESS",
          publishedBy: input.publishedBy,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Publish failed";
      results.push({ platform, success: false, error });
      await logPublish({
        contentType: "BLOG",
        contentId: blog.id,
        platform: platform.toUpperCase(),
        status: "FAILED",
        error,
        publishedBy: input.publishedBy,
      });
    }
  }

  return results;
}

async function publishReel(
  integration: NonNullable<Awaited<ReturnType<typeof getMetaIntegration>>>,
  input: MetaPublishInput,
  platforms: MetaPublishPlatform[]
): Promise<MetaPublishResult[]> {
  const reel = await prisma.reel.findUnique({
    where: { id: input.contentId },
    select: {
      id: true,
      caption: true,
      mediaUrl: true,
      thumbnailUrl: true,
      mediaType: true,
      status: true,
    },
  });

  if (!reel || reel.status !== ReelStatus.PUBLISHED) {
    throw new Error("Reel not found or not published");
  }

  const link = `${getAppUrl()}/reels/${reel.id}`;
  const message =
    input.customMessage?.trim() ||
    `${reel.caption.trim()}\n\nWatch on ContentVerse: ${link}`;
  const videoUrl = toPublicUrl(reel.mediaUrl);
  const imageUrl = toPublicUrl(reel.thumbnailUrl || reel.mediaUrl);

  if (!videoUrl && reel.mediaType === "VIDEO") {
    throw new Error("Reel video URL is missing");
  }

  const results: MetaPublishResult[] = [];

  for (const platform of platforms) {
    try {
      if (platform === "facebook") {
        const result =
          reel.mediaType === "VIDEO" && videoUrl
            ? await publishFacebookLinkPost(integration, { message, link })
            : imageUrl
              ? await publishFacebookPhotoPost(integration, {
                  message,
                  imageUrl,
                  link,
                })
              : await publishFacebookLinkPost(integration, { message, link });
        results.push({ platform, success: true, ...result });
        await logPublish({
          contentType: "REEL",
          contentId: reel.id,
          platform: "FACEBOOK",
          externalId: result.id,
          permalink: result.permalink,
          status: "SUCCESS",
          publishedBy: input.publishedBy,
        });
      } else {
        if (reel.mediaType !== "VIDEO" || !videoUrl) {
          throw new Error("Instagram Reels require a published video reel");
        }
        const result = await publishInstagramReel(integration, {
          videoUrl,
          caption: message,
        });
        results.push({ platform, success: true, ...result });
        await logPublish({
          contentType: "REEL",
          contentId: reel.id,
          platform: "INSTAGRAM",
          externalId: result.id,
          permalink: result.permalink,
          status: "SUCCESS",
          publishedBy: input.publishedBy,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Publish failed";
      results.push({ platform, success: false, error });
      await logPublish({
        contentType: "REEL",
        contentId: reel.id,
        platform: platform.toUpperCase(),
        status: "FAILED",
        error,
        publishedBy: input.publishedBy,
      });
    }
  }

  return results;
}

export async function getMetaPublishHistory(limit = 20) {
  if (!isDatabaseConfigured()) return [];
  return prisma.metaPublishLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getMetaPublishableContent(type: "blog" | "reel", q = "") {
  const query = q.trim();

  if (type === "blog") {
    return prisma.blog.findMany({
      where: {
        status: BlogStatus.PUBLISHED,
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { slug: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        publishedAt: true,
      },
    });
  }

  return prisma.reel.findMany({
    where: {
      status: ReelStatus.PUBLISHED,
      ...(query
        ? { caption: { contains: query, mode: "insensitive" } }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: {
      id: true,
      caption: true,
      thumbnailUrl: true,
      mediaType: true,
      publishedAt: true,
    },
  });
}
