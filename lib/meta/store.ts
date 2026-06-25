import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const META_INTEGRATION_KEY = "meta.integration";

export type MetaIntegration = {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  igUserId?: string | null;
  igUsername?: string | null;
  connectedAt: string;
  source: "oauth" | "manual" | "env";
};

function fromEnv(): MetaIntegration | null {
  const pageId = process.env.META_PAGE_ID?.trim();
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  const igUserId = process.env.META_IG_USER_ID?.trim() || null;
  if (!pageId || !pageAccessToken) return null;

  return {
    pageId,
    pageName: process.env.META_PAGE_NAME?.trim() || "Facebook Page",
    pageAccessToken,
    igUserId,
    igUsername: process.env.META_IG_USERNAME?.trim() || null,
    connectedAt: new Date(0).toISOString(),
    source: "env",
  };
}

function parseIntegration(value: unknown): MetaIntegration | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const pageId = typeof row.pageId === "string" ? row.pageId.trim() : "";
  const pageAccessToken =
    typeof row.pageAccessToken === "string" ? row.pageAccessToken.trim() : "";
  if (!pageId || !pageAccessToken) return null;

  return {
    pageId,
    pageName: typeof row.pageName === "string" ? row.pageName : "Facebook Page",
    pageAccessToken,
    igUserId: typeof row.igUserId === "string" ? row.igUserId : null,
    igUsername: typeof row.igUsername === "string" ? row.igUsername : null,
    connectedAt:
      typeof row.connectedAt === "string" ? row.connectedAt : new Date().toISOString(),
    source:
      row.source === "oauth" || row.source === "manual" || row.source === "env"
        ? row.source
        : "manual",
  };
}

export async function getMetaIntegration(): Promise<MetaIntegration | null> {
  const envFallback = fromEnv();
  if (envFallback) return envFallback;

  if (!isDatabaseConfigured()) return null;

  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: META_INTEGRATION_KEY },
    });
    return parseIntegration(row?.valueJson);
  } catch {
    return null;
  }
}

export async function saveMetaIntegration(
  integration: MetaIntegration
): Promise<MetaIntegration> {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  await prisma.siteSetting.upsert({
    where: { key: META_INTEGRATION_KEY },
    create: { key: META_INTEGRATION_KEY, valueJson: integration },
    update: { valueJson: integration },
  });

  return integration;
}

export async function clearMetaIntegration(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await prisma.siteSetting.deleteMany({ where: { key: META_INTEGRATION_KEY } });
}

export function maskMetaIntegration(
  integration: MetaIntegration | null
): Omit<MetaIntegration, "pageAccessToken"> & { connected: boolean; tokenPreview: string | null } {
  if (!integration) {
    return {
      connected: false,
      tokenPreview: null,
      pageId: "",
      pageName: "",
      igUserId: null,
      igUsername: null,
      connectedAt: "",
      source: "manual",
    };
  }

  const token = integration.pageAccessToken;
  const preview =
    token.length > 8 ? `${token.slice(0, 4)}…${token.slice(-4)}` : "••••";

  return {
    connected: true,
    tokenPreview: preview,
    pageId: integration.pageId,
    pageName: integration.pageName,
    igUserId: integration.igUserId ?? null,
    igUsername: integration.igUsername ?? null,
    connectedAt: integration.connectedAt,
    source: integration.source,
  };
}
