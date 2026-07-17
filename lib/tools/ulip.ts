/**
 * ULIP (DPIIT) API client — VAHAN, ECHALLAN, FASTAG.
 * Credentials via env only. Never commit secrets.
 *
 * ULIP_BASE_URL=https://www.ulip.dpiit.gov.in/ulip/v1.0.0
 * ULIP_USERNAME=...
 * ULIP_PASSWORD=...
 *
 * Optional staging override:
 * ULIP_STAGING_BASE_URL=https://www.ulipstaging.dpiit.gov.in/ulip/v1.0.0
 * ULIP_STAGING_USERNAME=...
 * ULIP_STAGING_PASSWORD=...
 */

type UlipEnv = "prod" | "staging";

type TokenCache = { token: string; expiresAt: number };

const tokenCache: Partial<Record<UlipEnv, TokenCache>> = {};

function baseUrl(env: UlipEnv): string {
  if (env === "staging") {
    return (
      process.env.ULIP_STAGING_BASE_URL?.trim() ||
      "https://www.ulipstaging.dpiit.gov.in/ulip/v1.0.0"
    );
  }
  return (
    process.env.ULIP_BASE_URL?.trim() ||
    "https://www.ulip.dpiit.gov.in/ulip/v1.0.0"
  );
}

function credentials(env: UlipEnv): { username: string; password: string } | null {
  if (env === "staging") {
    const username = process.env.ULIP_STAGING_USERNAME?.trim();
    const password = process.env.ULIP_STAGING_PASSWORD?.trim();
    if (!username || !password) return null;
    return { username, password };
  }
  const username = process.env.ULIP_USERNAME?.trim();
  const password = process.env.ULIP_PASSWORD?.trim();
  if (!username || !password) return null;
  return { username, password };
}

export function isUlipConfigured(env: UlipEnv = "prod"): boolean {
  return Boolean(credentials(env));
}

function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.token === "string") return p.token;
  if (typeof p.id === "string" && p.id.length > 40) return p.id;
  const response = p.response;
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    if (typeof r.token === "string") return r.token;
    if (typeof r.id === "string") return r.id;
  }
  return null;
}

async function login(env: UlipEnv): Promise<string> {
  const cached = tokenCache[env];
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const creds = credentials(env);
  if (!creds) {
    throw new Error(`ULIP ${env} credentials not configured`);
  }

  const res = await fetch(`${baseUrl(env)}/user/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(creds),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`ULIP login failed (${res.status})`);
  }

  const token = extractToken(json);
  if (!token) {
    throw new Error("ULIP login succeeded but no token in response");
  }

  // Tokens typically last hours; refresh after 50 minutes
  tokenCache[env] = { token, expiresAt: Date.now() + 50 * 60_000 };
  return token;
}

async function ulipPost<T = unknown>(
  path: string,
  body: Record<string, string>,
  env: UlipEnv
): Promise<T> {
  const token = await login(env);
  const res = await fetch(`${baseUrl(env)}/${path.replace(/^\//, "")}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as T | null;
  if (!res.ok) {
    // One retry on auth failure
    if (res.status === 401 || res.status === 403) {
      delete tokenCache[env];
      const retryToken = await login(env);
      const retry = await fetch(`${baseUrl(env)}/${path.replace(/^\//, "")}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${retryToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const retryJson = (await retry.json().catch(() => null)) as T | null;
      if (!retry.ok || !retryJson) {
        throw new Error(`ULIP ${path} failed (${retry.status})`);
      }
      return retryJson;
    }
    throw new Error(`ULIP ${path} failed (${res.status})`);
  }
  if (!json) throw new Error(`ULIP ${path} empty response`);
  return json;
}

function normalizeVehicleNumber(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]/g, "");
}

export type VahanLookupResult = {
  ok: boolean;
  vehicleNumber: string;
  raw: unknown;
  fields: Record<string, string>;
  message?: string;
};

function flattenFields(obj: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (obj == null) return out;
  if (typeof obj !== "object") {
    if (prefix) out[prefix] = String(obj);
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      Object.assign(out, flattenFields(item, prefix ? `${prefix}.${i}` : String(i)));
    });
    return out;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === "object") {
      Object.assign(out, flattenFields(v, key));
    } else if (v != null && String(v).trim()) {
      out[key] = String(v);
    }
  }
  return out;
}

function pickUsefulFields(flat: Record<string, string>): Record<string, string> {
  const prefer = [
    "rc_regn_no",
    "rc_owner_name",
    "rc_regn_dt",
    "rc_fit_upto",
    "rc_tax_upto",
    "rc_insurance_upto",
    "rc_insurance_comp",
    "rc_status",
    "rc_vch_catg",
    "rc_vh_class_desc",
    "rc_maker_desc",
    "rc_maker_model",
    "rc_body_type_desc",
    "rc_fuel_desc",
    "rc_color",
    "rc_chasi_no",
    "rc_eng_no",
    "rc_registered_at",
    "rc_owner_sr",
    "rc_financer",
    "rc_pucc_upto",
    "rc_blacklist_status",
  ];
  const out: Record<string, string> = {};
  for (const key of prefer) {
    const hit = Object.entries(flat).find(
      ([k]) => k === key || k.endsWith(`.${key}`) || k.toLowerCase().includes(key)
    );
    if (hit) out[key] = hit[1];
  }
  // If prefer list empty, take first 20 flat keys
  if (Object.keys(out).length === 0) {
    for (const [k, v] of Object.entries(flat).slice(0, 20)) out[k] = v;
  }
  return out;
}

export async function lookupVahan(vehicleNumber: string): Promise<VahanLookupResult> {
  const vehiclenumber = normalizeVehicleNumber(vehicleNumber);
  if (!/^[A-Z0-9]{5,14}$/.test(vehiclenumber)) {
    return {
      ok: false,
      vehicleNumber: vehiclenumber,
      raw: null,
      fields: {},
      message: "Enter a valid vehicle number (e.g. UP32KH0320)",
    };
  }

  // Staging account has VAHAN per user's credentials
  const env: UlipEnv = isUlipConfigured("staging") ? "staging" : "prod";
  if (!isUlipConfigured(env)) {
    return {
      ok: false,
      vehicleNumber: vehiclenumber,
      raw: null,
      fields: {},
      message: "Vehicle RC lookup is not configured on this server",
    };
  }

  try {
    const raw = await ulipPost("VAHAN/01", { vehiclenumber }, env);
    const flat = flattenFields(raw);
    const fields = pickUsefulFields(flat);
    const failed =
      flat.message?.toLowerCase().includes("not found") ||
      flat["response.0.response.message"]?.toLowerCase().includes("not found");

    return {
      ok: !failed && Object.keys(fields).length > 0,
      vehicleNumber: vehiclenumber,
      raw,
      fields,
      message: failed ? "No vehicle record found" : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      vehicleNumber: vehiclenumber,
      raw: null,
      fields: {},
      message: err instanceof Error ? err.message : "VAHAN lookup failed",
    };
  }
}

export type ChallanLookupResult = {
  ok: boolean;
  vehicleNumber: string;
  raw: unknown;
  challans: Array<Record<string, string>>;
  message?: string;
};

export async function lookupEchallan(vehicleNumber: string): Promise<ChallanLookupResult> {
  const vehicle = normalizeVehicleNumber(vehicleNumber);
  if (!/^[A-Z0-9]{5,14}$/.test(vehicle)) {
    return {
      ok: false,
      vehicleNumber: vehicle,
      raw: null,
      challans: [],
      message: "Enter a valid vehicle number",
    };
  }

  // Production account has ECHALLAN per user's credentials
  const env: UlipEnv = isUlipConfigured("prod") ? "prod" : "staging";
  if (!isUlipConfigured(env)) {
    return {
      ok: false,
      vehicleNumber: vehicle,
      raw: null,
      challans: [],
      message: "e-Challan lookup is not configured on this server",
    };
  }

  try {
    // Production ULIP ECHALLAN uses camelCase vehicleNumber
    const raw = await ulipPost("ECHALLAN/01", { vehicleNumber: vehicle }, env);
    const flat = flattenFields(raw);
    const challans: Array<Record<string, string>> = [];

    // Common shape: response[].response has challan list or nested data
    const response = (raw as { response?: unknown })?.response;
    if (Array.isArray(response)) {
      for (const item of response) {
        const inner = (item as { response?: unknown })?.response ?? item;
        if (Array.isArray(inner)) {
          for (const c of inner) challans.push(flattenFields(c));
        } else if (inner && typeof inner === "object") {
          const rec = flattenFields(inner);
          if (Object.keys(rec).length) challans.push(rec);
        }
      }
    }

    if (!challans.length && Object.keys(flat).length) {
      // single blob
      const msg = Object.values(flat).join(" ").toLowerCase();
      if (msg.includes("no record") || msg.includes("not found")) {
        return {
          ok: true,
          vehicleNumber: vehicle,
          raw,
          challans: [],
          message: "No pending challans found",
        };
      }
    }

    return {
      ok: true,
      vehicleNumber: vehicle,
      raw,
      challans,
      message: challans.length ? undefined : "No challan records returned",
    };
  } catch (err) {
    return {
      ok: false,
      vehicleNumber: vehicle,
      raw: null,
      challans: [],
      message: err instanceof Error ? err.message : "e-Challan lookup failed",
    };
  }
}

export type FastagLookupResult = {
  ok: boolean;
  vehicleNumber: string;
  raw: unknown;
  fields: Record<string, string>;
  message?: string;
};

export async function lookupFastag(vehicleNumber: string): Promise<FastagLookupResult> {
  const vehiclenumber = normalizeVehicleNumber(vehicleNumber);
  if (!/^[A-Z0-9]{5,14}$/.test(vehiclenumber)) {
    return {
      ok: false,
      vehicleNumber: vehiclenumber,
      raw: null,
      fields: {},
      message: "Enter a valid vehicle number",
    };
  }

  const env: UlipEnv = isUlipConfigured("staging") ? "staging" : "prod";
  if (!isUlipConfigured(env)) {
    return {
      ok: false,
      vehicleNumber: vehiclenumber,
      raw: null,
      fields: {},
      message: "FASTag lookup is not configured on this server",
    };
  }

  try {
    const raw = await ulipPost("FASTAG/01", { vehiclenumber }, env);
    const fields = pickUsefulFields(flattenFields(raw));
    return {
      ok: Object.keys(fields).length > 0,
      vehicleNumber: vehiclenumber,
      raw,
      fields,
      message: Object.keys(fields).length ? undefined : "No FASTag data returned",
    };
  } catch (err) {
    return {
      ok: false,
      vehicleNumber: vehiclenumber,
      raw: null,
      fields: {},
      message: err instanceof Error ? err.message : "FASTag lookup failed",
    };
  }
}
