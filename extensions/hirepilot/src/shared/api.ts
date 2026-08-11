import { DEFAULT_API_BASE, type MeResponse, type ScrapedJob } from "./types";

const TOKEN_KEY = "jobpilot_token";
const API_BASE_KEY = "jobpilot_api_base";

export async function getApiBase(): Promise<string> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) {
    return DEFAULT_API_BASE;
  }
  try {
    const stored = await chrome.storage.local.get(API_BASE_KEY);
    const val = stored[API_BASE_KEY] as string | undefined;
    if (val && val.startsWith("http")) return val;
  } catch {
    // storage not available
  }
  return DEFAULT_API_BASE;
}

export async function getToken(): Promise<string | null> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return null;
  try {
    const stored = await chrome.storage.local.get(TOKEN_KEY);
    return (stored[TOKEN_KEY] as string) || null;
  } catch {
    return null;
  }
}

export async function setApiBase(url: string) {
  await chrome.storage.local.set({ [API_BASE_KEY]: url.replace(/\/$/, "") });
}

export async function setToken(token: string | null) {
  if (!token) {
    await chrome.storage.local.remove(TOKEN_KEY);
    return;
  }
  await chrome.storage.local.set({ [TOKEN_KEY]: token });
}

async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const [base, token] = await Promise.all([getApiBase(), getToken()]);
  if (!token) throw new Error("NOT_SIGNED_IN");

  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      (data as { error?: string }).error || `Request failed (${res.status})`
    ) as Error & { code?: string; upgrade?: boolean; status?: number };
    err.code = (data as { code?: string }).code;
    err.upgrade = (data as { upgrade?: boolean }).upgrade;
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export async function fetchMe() {
  return api<MeResponse>("/api/jobpilot/me");
}

export async function analyzeJob(job: ScrapedJob) {
  return api<{
    analysis: import("./types").AnalysisResult;
    usage: import("./types").UsageSnapshot;
  }>("/api/jobpilot/analyze", {
    method: "POST",
    body: JSON.stringify({
      url: job.url,
      source: job.source,
      title: job.title,
      company: job.company,
      jdText: job.jdText,
    }),
  });
}

export async function generateCoverLetter(
  analysisId: string,
  style: "PROFESSIONAL" | "SHORT" | "STARTUP"
) {
  return api<{
    coverLetter: { id: string; style: string; content: string };
    usage: import("./types").UsageSnapshot;
  }>("/api/jobpilot/cover-letter", {
    method: "POST",
    body: JSON.stringify({ analysisId, style }),
  });
}

export async function saveToTracker(input: {
  analysisId?: string;
  title: string;
  company?: string | null;
  url?: string;
  status?: string;
}) {
  return api<{ ok: boolean }>("/api/jobpilot/tracker", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadResumeText(text: string) {
  return api("/api/jobpilot/resume", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function loginUrl(apiBase: string) {
  return `${apiBase.replace(/\/$/, "")}/jobpilot/login?ext=1`;
}

export function trackerUrl(apiBase: string) {
  return `${apiBase.replace(/\/$/, "")}/jobpilot/tracker`;
}
