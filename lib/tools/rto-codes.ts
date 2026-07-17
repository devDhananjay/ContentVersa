/**
 * India RTO / vehicle registration office lookup.
 * Dataset: 1200+ offices from public RTO code lists + curated addresses.
 */
import officesJson from "./data/rto-offices.json";

export type RtoOffice = {
  code: string;
  city: string;
  state: string;
  stateCode: string;
  address: string;
};

export const RTO_OFFICES = officesJson as RtoOffice[];

export const STATE_RTO_CODES: Record<string, string> = Object.fromEntries(
  [...new Map(RTO_OFFICES.map((o) => [o.stateCode, o.state])).entries()]
);

export function searchRto(query: string, limit = 40): RtoOffice[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, "");
  const qSpaces = query.trim().toLowerCase();
  if (!qSpaces) return RTO_OFFICES.slice(0, limit);

  const scored = RTO_OFFICES.map((r) => {
    const code = r.code.toLowerCase();
    const city = r.city.toLowerCase();
    const state = r.state.toLowerCase();
    const address = r.address.toLowerCase();
    let score = 0;
    if (code === q || code === qSpaces.replace(/\s/g, "")) score = 100;
    else if (code.startsWith(q)) score = 90;
    else if (city === qSpaces) score = 85;
    else if (city.startsWith(qSpaces)) score = 75;
    else if (city.includes(qSpaces)) score = 60;
    else if (state.includes(qSpaces)) score = 40;
    else if (address.includes(qSpaces)) score = 35;
    else if (code.includes(q)) score = 50;
    return { r, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.r.code.localeCompare(b.r.code));

  return scored.slice(0, limit).map((x) => x.r);
}

export function decodeVehiclePlate(plate: string): {
  normalized: string;
  stateCode?: string;
  stateName?: string;
  rtoCode?: string;
  rto?: RtoOffice | null;
  series?: string;
  number?: string;
  isBhSeries: boolean;
  message: string;
} {
  const normalized = plate.trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) {
    return { normalized, isBhSeries: false, message: "Enter a vehicle number" };
  }

  const bh = normalized.match(/^(\d{2})BH(\d{4})([A-Z]{1,2})$/);
  if (bh) {
    return {
      normalized,
      stateCode: "BH",
      stateName: "Bharat Series (pan-India transferable)",
      rtoCode: `BH-${bh[1]}`,
      series: bh[3],
      number: bh[2],
      isBhSeries: true,
      message: "Bharat (BH) series plate — valid across states without re-registration",
      rto: null,
    };
  }

  const std = normalized.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/);
  if (!std) {
    return {
      normalized,
      isBhSeries: false,
      message: "Could not decode — use format like MH12AB1234 or 22BH1234AA",
      rto: null,
    };
  }

  const stateCode = std[1];
  const stateName = STATE_RTO_CODES[stateCode];
  const rtoCode = `${stateCode}${std[2].padStart(2, "0")}`;
  const rto = RTO_OFFICES.find((o) => o.code === rtoCode) ?? null;

  return {
    normalized,
    stateCode,
    stateName: stateName ?? rto?.state,
    rtoCode,
    rto,
    series: std[3],
    number: std[4],
    isBhSeries: false,
    message: rto
      ? `${rto.city}, ${rto.state} — ${rtoCode}`
      : stateName
        ? `Registered in ${stateName} — RTO ${rtoCode}`
        : `RTO code ${rtoCode} (state code ${stateCode})`,
  };
}
