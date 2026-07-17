export type RtoOffice = {
  code: string;
  city: string;
  state: string;
  stateCode: string;
};

/** Major RTO offices — searchable reference (not exhaustive). */
export const RTO_OFFICES: RtoOffice[] = [
  { code: "DL01", city: "Mall Road, Delhi", state: "Delhi", stateCode: "DL" },
  { code: "DL02", city: "Tilak Marg, New Delhi", state: "Delhi", stateCode: "DL" },
  { code: "DL03", city: "Sheikh Sarai, South Delhi", state: "Delhi", stateCode: "DL" },
  { code: "DL04", city: "Janakpuri, West Delhi", state: "Delhi", stateCode: "DL" },
  { code: "DL05", city: "Loni Road, East Delhi", state: "Delhi", stateCode: "DL" },
  { code: "DL08", city: "Wazir Pur, North West Delhi", state: "Delhi", stateCode: "DL" },
  { code: "DL09", city: "Rohini, North West Delhi", state: "Delhi", stateCode: "DL" },
  { code: "DL10", city: "Raja Garden, West Delhi", state: "Delhi", stateCode: "DL" },
  { code: "DL11", city: "Rohini Sector 22", state: "Delhi", stateCode: "DL" },
  { code: "DL12", city: "Vasant Vihar, South West Delhi", state: "Delhi", stateCode: "DL" },
  { code: "DL13", city: "Surajmal Vihar, Shahdara", state: "Delhi", stateCode: "DL" },
  { code: "MH01", city: "Mumbai (South)", state: "Maharashtra", stateCode: "MH" },
  { code: "MH02", city: "Mumbai (West)", state: "Maharashtra", stateCode: "MH" },
  { code: "MH03", city: "Mumbai (East)", state: "Maharashtra", stateCode: "MH" },
  { code: "MH04", city: "Thane", state: "Maharashtra", stateCode: "MH" },
  { code: "MH12", city: "Pune", state: "Maharashtra", stateCode: "MH" },
  { code: "MH14", city: "Pimpri-Chinchwad", state: "Maharashtra", stateCode: "MH" },
  { code: "MH43", city: "Nagpur (East)", state: "Maharashtra", stateCode: "MH" },
  { code: "MH31", city: "Nashik", state: "Maharashtra", stateCode: "MH" },
  { code: "KA01", city: "Bangalore (Koramangala)", state: "Karnataka", stateCode: "KA" },
  { code: "KA02", city: "Bangalore (Rajajinagar)", state: "Karnataka", stateCode: "KA" },
  { code: "KA03", city: "Bangalore (Indiranagar)", state: "Karnataka", stateCode: "KA" },
  { code: "KA04", city: "Bangalore (Yeshwanthpur)", state: "Karnataka", stateCode: "KA" },
  { code: "KA05", city: "Bangalore (Jayanagar)", state: "Karnataka", stateCode: "KA" },
  { code: "KA51", city: "Mysuru", state: "Karnataka", stateCode: "KA" },
  { code: "TN01", city: "Chennai (Central)", state: "Tamil Nadu", stateCode: "TN" },
  { code: "TN02", city: "Chennai (North West)", state: "Tamil Nadu", stateCode: "TN" },
  { code: "TN07", city: "Chennai (South)", state: "Tamil Nadu", stateCode: "TN" },
  { code: "TN09", city: "Chennai (West)", state: "Tamil Nadu", stateCode: "TN" },
  { code: "TN37", city: "Coimbatore (South)", state: "Tamil Nadu", stateCode: "TN" },
  { code: "TN10", city: "Chennai (South East)", state: "Tamil Nadu", stateCode: "TN" },
  { code: "GJ01", city: "Ahmedabad", state: "Gujarat", stateCode: "GJ" },
  { code: "GJ05", city: "Surat", state: "Gujarat", stateCode: "GJ" },
  { code: "GJ06", city: "Vadodara", state: "Gujarat", stateCode: "GJ" },
  { code: "RJ14", city: "Jaipur (South)", state: "Rajasthan", stateCode: "RJ" },
  { code: "RJ45", city: "Jaipur (North)", state: "Rajasthan", stateCode: "RJ" },
  { code: "UP14", city: "Ghaziabad", state: "Uttar Pradesh", stateCode: "UP" },
  { code: "UP16", city: "Noida", state: "Uttar Pradesh", stateCode: "UP" },
  { code: "UP32", city: "Lucknow", state: "Uttar Pradesh", stateCode: "UP" },
  { code: "UP80", city: "Kanpur", state: "Uttar Pradesh", stateCode: "UP" },
  { code: "HR26", city: "Gurgaon", state: "Haryana", stateCode: "HR" },
  { code: "HR51", city: "Faridabad", state: "Haryana", stateCode: "HR" },
  { code: "HR55", city: "Gurgaon (South)", state: "Haryana", stateCode: "HR" },
  { code: "PB10", city: "Chandigarh", state: "Punjab", stateCode: "PB" },
  { code: "PB11", city: "Ludhiana", state: "Punjab", stateCode: "PB" },
  { code: "WB06", city: "Kolkata (Salt Lake)", state: "West Bengal", stateCode: "WB" },
  { code: "WB07", city: "Kolkata (Behala)", state: "West Bengal", stateCode: "WB" },
  { code: "WB08", city: "Kolkata (Jadavpur)", state: "West Bengal", stateCode: "WB" },
  { code: "TS07", city: "Hyderabad (West)", state: "Telangana", stateCode: "TS" },
  { code: "TS09", city: "Hyderabad (Central)", state: "Telangana", stateCode: "TS" },
  { code: "TS13", city: "Hyderabad (East)", state: "Telangana", stateCode: "TS" },
  { code: "AP39", city: "Vijayawada", state: "Andhra Pradesh", stateCode: "AP" },
  { code: "KL01", city: "Thiruvananthapuram", state: "Kerala", stateCode: "KL" },
  { code: "KL07", city: "Ernakulam", state: "Kerala", stateCode: "KL" },
  { code: "KL17", city: "Kozhikode", state: "Kerala", stateCode: "KL" },
  { code: "MP04", city: "Bhopal", state: "Madhya Pradesh", stateCode: "MP" },
  { code: "MP09", city: "Indore", state: "Madhya Pradesh", stateCode: "MP" },
  { code: "BR01", city: "Patna", state: "Bihar", stateCode: "BR" },
  { code: "OR02", city: "Bhubaneswar", state: "Odisha", stateCode: "OR" },
  { code: "CG04", city: "Raipur", state: "Chhattisgarh", stateCode: "CG" },
  { code: "JH01", city: "Ranchi", state: "Jharkhand", stateCode: "JH" },
  { code: "UK07", city: "Dehradun", state: "Uttarakhand", stateCode: "UK" },
  { code: "HP01", city: "Shimla", state: "Himachal Pradesh", stateCode: "HP" },
  { code: "GA03", city: "Panaji", state: "Goa", stateCode: "GA" },
  { code: "AS01", city: "Guwahati", state: "Assam", stateCode: "AS" },
];

export const STATE_RTO_CODES: Record<string, string> = {
  AN: "Andaman & Nicobar",
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CG: "Chhattisgarh",
  CH: "Chandigarh",
  DD: "Daman & Diu",
  DL: "Delhi",
  GA: "Goa",
  GJ: "Gujarat",
  HP: "Himachal Pradesh",
  HR: "Haryana",
  JH: "Jharkhand",
  JK: "Jammu & Kashmir",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  LD: "Lakshadweep",
  MH: "Maharashtra",
  ML: "Meghalaya",
  MN: "Manipur",
  MP: "Madhya Pradesh",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  OR: "Odisha",
  PB: "Punjab",
  PY: "Puducherry",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TR: "Tripura",
  TS: "Telangana",
  UK: "Uttarakhand",
  UP: "Uttar Pradesh",
  WB: "West Bengal",
};

export function searchRto(query: string, limit = 25): RtoOffice[] {
  const q = query.trim().toLowerCase();
  if (!q) return RTO_OFFICES.slice(0, limit);
  return RTO_OFFICES.filter(
    (r) =>
      r.code.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.state.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function decodeVehiclePlate(plate: string): {
  normalized: string;
  stateCode?: string;
  stateName?: string;
  rtoCode?: string;
  series?: string;
  number?: string;
  isBhSeries: boolean;
  message: string;
} {
  const normalized = plate.trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) {
    return { normalized, isBhSeries: false, message: "Enter a vehicle number" };
  }

  // Bharat (BH) series: 22 BH 1234 AA
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
    };
  }

  // Standard: DL01AB1234 or DL01A1234 or DL1CA1234 (old)
  const std = normalized.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/);
  if (!std) {
    return {
      normalized,
      isBhSeries: false,
      message: "Could not decode — use format like MH12AB1234 or 22BH1234AA",
    };
  }

  const stateCode = std[1];
  const stateName = STATE_RTO_CODES[stateCode];
  const rtoCode = `${stateCode}${std[2].padStart(2, "0")}`;

  return {
    normalized,
    stateCode,
    stateName,
    rtoCode,
    series: std[3],
    number: std[4],
    isBhSeries: false,
    message: stateName
      ? `Registered in ${stateName} — RTO ${rtoCode}`
      : `RTO code ${rtoCode} (state code ${stateCode})`,
  };
}
