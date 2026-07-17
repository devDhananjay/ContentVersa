/** EPIC / Voter ID format helpers (format only). */

export type EpicValidation = {
  valid: boolean;
  message: string;
  normalized?: string;
};

/** Common EPIC pattern: 3 letters + 7 digits (varies by state; we accept 10 alphanumeric). */
export function validateEpic(input: string): EpicValidation {
  const cleaned = input.replace(/\s+/g, "").toUpperCase();
  if (!cleaned) return { valid: false, message: "Enter a Voter ID / EPIC number" };
  if (!/^[A-Z0-9]{10}$/.test(cleaned)) {
    return {
      valid: false,
      message: "Typical EPIC is 10 characters (letters + digits), e.g. ABC1234567",
      normalized: cleaned,
    };
  }
  if (!/^[A-Z]{3}[0-9]{7}$/.test(cleaned) && !/^[A-Z0-9]{10}$/.test(cleaned)) {
    return { valid: false, message: "Unexpected EPIC format", normalized: cleaned };
  }
  return {
    valid: true,
    message: "Format looks like a Voter ID / EPIC number",
    normalized: cleaned,
  };
}
