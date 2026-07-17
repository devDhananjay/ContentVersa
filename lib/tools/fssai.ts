/** FSSAI license / registration format helpers (format only — not live FoSCoS). */

export type FssaiValidation = {
  valid: boolean;
  message: string;
  kind?: "Central License" | "State License" | "Registration" | "Unknown";
  normalized?: string;
};

/**
 * Typical FSSAI numbers are 14 digits.
 * Digit 1 often indicates category (1=Central, 2=State, 3=Registration) but
 * formats vary — we treat 14 digits as the primary format check.
 */
export function validateFssai(input: string): FssaiValidation {
  const cleaned = input.replace(/\s+/g, "").trim();
  if (!cleaned) {
    return { valid: false, message: "Enter a FSSAI license / registration number" };
  }
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: "FSSAI number should contain digits only" };
  }
  if (cleaned.length !== 14) {
    return {
      valid: false,
      message: `Expected 14 digits, got ${cleaned.length}`,
      normalized: cleaned,
    };
  }

  const first = cleaned[0];
  const kind =
    first === "1"
      ? "Central License"
      : first === "2"
        ? "State License"
        : first === "3"
          ? "Registration"
          : "Unknown";

  return {
    valid: true,
    message: "Format looks valid (14-digit FSSAI number)",
    kind,
    normalized: cleaned,
  };
}
