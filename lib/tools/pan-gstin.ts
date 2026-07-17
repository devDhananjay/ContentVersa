const PAN_REGEX = /^[A-Z]{3}[PCHABGJLFT][A-Z][0-9]{4}[A-Z]$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const PAN_ENTITY: Record<string, string> = {
  P: "Individual",
  C: "Company",
  H: "HUF (Hindu Undivided Family)",
  A: "Association of Persons",
  B: "Body of Individuals",
  G: "Government Agency",
  J: "Artificial Juridical Person",
  L: "Local Authority",
  F: "Firm / Partnership",
  T: "Trust",
};

const GST_STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra & Nagar Haveli and Daman & Diu",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
  "97": "Other Territory",
  "99": "Centre Jurisdiction",
};

const GSTIN_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function gstinChecksum(gstin: string): boolean {
  let sum = 0;
  const factor = [1, 2];
  for (let i = 0; i < 14; i++) {
    const code = GSTIN_CHARS.indexOf(gstin[i]);
    if (code < 0) return false;
    const product = code * factor[i % 2];
    sum += Math.floor(product / 36) + (product % 36);
  }
  const check = (36 - (sum % 36)) % 36;
  return GSTIN_CHARS[check] === gstin[14];
}

export type PanValidation = {
  valid: boolean;
  normalized: string;
  entityType?: string;
  message: string;
};

export type GstinValidation = {
  valid: boolean;
  normalized: string;
  stateCode?: string;
  stateName?: string;
  panEmbedded?: string;
  checksumValid?: boolean;
  message: string;
};

export function validatePan(input: string): PanValidation {
  const normalized = input.trim().toUpperCase().replace(/\s/g, "");
  if (!normalized) {
    return { valid: false, normalized, message: "Enter a PAN number" };
  }
  if (normalized.length !== 10) {
    return { valid: false, normalized, message: "PAN must be 10 characters (e.g. ABCDE1234F)" };
  }
  if (!PAN_REGEX.test(normalized)) {
    return { valid: false, normalized, message: "Invalid PAN format" };
  }
  const entityType = PAN_ENTITY[normalized[3]] ?? "Unknown entity type";
  return {
    valid: true,
    normalized,
    entityType,
    message: `Valid PAN format — ${entityType}`,
  };
}

export function validateGstin(input: string): GstinValidation {
  const normalized = input.trim().toUpperCase().replace(/\s/g, "");
  if (!normalized) {
    return { valid: false, normalized, message: "Enter a GSTIN" };
  }
  if (normalized.length !== 15) {
    return {
      valid: false,
      normalized,
      message: "GSTIN must be 15 characters (e.g. 29AABCT1332L1ZS)",
    };
  }
  if (!GSTIN_REGEX.test(normalized)) {
    return { valid: false, normalized, message: "Invalid GSTIN format" };
  }
  const checksumValid = gstinChecksum(normalized);
  const stateCode = normalized.slice(0, 2);
  const stateName = GST_STATE_CODES[stateCode];
  const panEmbedded = normalized.slice(2, 12);
  if (!checksumValid) {
    return {
      valid: false,
      normalized,
      stateCode,
      stateName,
      panEmbedded,
      checksumValid: false,
      message: "GSTIN format looks right but checksum failed — verify the number",
    };
  }
  return {
    valid: true,
    normalized,
    stateCode,
    stateName,
    panEmbedded,
    checksumValid: true,
    message: stateName
      ? `Valid GSTIN format — ${stateName}`
      : "Valid GSTIN format and checksum",
  };
}
