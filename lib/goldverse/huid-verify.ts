import { BIS_ENDPOINTS, getHuidServiceToken } from "./bis-auth";
import type { HuidRecord, HuidVerifyResult } from "./types";

export const HUID_PATTERN = /^[A-Z0-9]{6}$/;

function mockHuidResponse(huid: string): HuidVerifyResult {
  return {
    ok: true,
    source: "mock",
    message: "Mock response — set BIS_MOCK=false for live API",
    huid,
    data: {
      huid,
      purity: "22K916",
      articleType: "Ring",
      jewellerName: "Sample Jewellers Pvt Ltd",
      hallmarkCentre: "Sample Assaying & Hallmarking Centre",
      dateOfMarking: "2024-11-15",
      status: "Valid",
    },
  };
}

function normalizeHuidRecord(
  record: Record<string, unknown>,
  huid: string
): HuidRecord {
  return {
    huid: String(record.uid_id ?? huid),
    purity: record.purity ? String(record.purity) : undefined,
    articleType: record.product ? String(record.product) : undefined,
    material: record.material ? String(record.material) : undefined,
    jewellerName: String(
      record.str_outlet_name ?? record.hallmarked_by_name ?? ""
    ) || undefined,
    jewellerRegNo: String(
      record.str_jwl_regno ?? record.hallmarked_by_reg ?? ""
    ) || undefined,
    jewellerAddress:
      [record.str_address1, record.str_address2, record.str_address]
        .filter(Boolean)
        .join(", ") || undefined,
    hallmarkCentre: record.str_ahc_name ? String(record.str_ahc_name) : undefined,
    ahcRegNo: record.str_ahc_regno ? String(record.str_ahc_regno) : undefined,
    pincode: record.num_pin_code ? String(record.num_pin_code) : undefined,
    dateOfMarking: record.hallmark_date ? String(record.hallmark_date) : undefined,
    status: record.status ? String(record.status) : undefined,
    weight: record.weight ? String(record.weight) : undefined,
  };
}

export async function verifyHuid(huid: string): Promise<HuidVerifyResult> {
  const trimmed = huid.trim().toUpperCase();
  if (!trimmed) {
    return { ok: false, source: "bis", message: "HUID is required" };
  }
  if (!HUID_PATTERN.test(trimmed)) {
    return {
      ok: false,
      source: "bis",
      message: "HUID must be exactly 6 letters or numbers",
      huid: trimmed,
    };
  }

  if (process.env.BIS_MOCK === "true") {
    await new Promise((r) => setTimeout(r, 400));
    return mockHuidResponse(trimmed);
  }

  let token: string;
  try {
    token = await getHuidServiceToken();
  } catch (error) {
    return {
      ok: false,
      source: "bis",
      message:
        error instanceof Error
          ? error.message
          : "Could not connect to BIS service",
    };
  }

  const res = await fetch(BIS_ENDPOINTS.getHuid, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ uid: trimmed }),
    cache: "no-store",
  });

  const raw = (await res.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (res.status === 401) {
    return {
      ok: false,
      source: "bis",
      message: "BIS service token expired. Try again.",
      huid: trimmed,
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      source: "bis",
      message: `BIS API HTTP ${res.status}`,
      huid: trimmed,
    };
  }

  const dataField = raw?.data;
  const records = Array.isArray(dataField) ? dataField : [];
  const message = String(raw?.message ?? "");

  if (!records.length) {
    return {
      ok: false,
      source: "bis",
      message: message || "No HUID details found — may be fake or not registered",
      huid: trimmed,
    };
  }

  const first = records[0];
  const payload =
    typeof first === "object" && first
      ? normalizeHuidRecord(first as Record<string, unknown>, trimmed)
      : { huid: trimmed };

  return {
    ok: true,
    source: "bis",
    message,
    huid: trimmed,
    data: payload,
  };
}
