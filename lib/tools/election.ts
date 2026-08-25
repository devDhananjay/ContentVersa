/** EPIC / Voter ID helpers and Indian state list for the election tool. */

export type EpicValidation = {
  valid: boolean;
  message: string;
  normalized?: string;
};

export const INDIAN_STATES_AND_UTS = [
  ["AN", "Andaman and Nicobar Islands"],
  ["AP", "Andhra Pradesh"],
  ["AR", "Arunachal Pradesh"],
  ["AS", "Assam"],
  ["BR", "Bihar"],
  ["CH", "Chandigarh"],
  ["CG", "Chhattisgarh"],
  ["DD", "Dadra and Nagar Haveli and Daman and Diu"],
  ["GA", "Goa"],
  ["GJ", "Gujarat"],
  ["HR", "Haryana"],
  ["HP", "Himachal Pradesh"],
  ["JK", "Jammu and Kashmir"],
  ["JH", "Jharkhand"],
  ["KA", "Karnataka"],
  ["KL", "Kerala"],
  ["LA", "Ladakh"],
  ["LD", "Lakshadweep"],
  ["MP", "Madhya Pradesh"],
  ["MH", "Maharashtra"],
  ["MN", "Manipur"],
  ["ML", "Meghalaya"],
  ["MZ", "Mizoram"],
  ["NL", "Nagaland"],
  ["DL", "NCT of Delhi"],
  ["OD", "Odisha"],
  ["PY", "Puducherry"],
  ["PB", "Punjab"],
  ["RJ", "Rajasthan"],
  ["SK", "Sikkim"],
  ["TN", "Tamil Nadu"],
  ["TS", "Telangana"],
  ["TR", "Tripura"],
  ["UP", "Uttar Pradesh"],
  ["UK", "Uttarakhand"],
  ["WB", "West Bengal"],
] as const;

/** Common EPIC pattern: 3 letters + 7 digits. */
export function validateEpic(input: string): EpicValidation {
  const cleaned = input.replace(/[\s\-_/]/g, "").toUpperCase();
  if (!cleaned) return { valid: false, message: "Enter a Voter ID / EPIC number" };
  if (!/^[A-Z]{3}[0-9]{7}$/.test(cleaned)) {
    return {
      valid: false,
      message: "Typical EPIC is 3 letters + 7 digits, e.g. ABC1234567",
      normalized: cleaned,
    };
  }
  return {
    valid: true,
    message: "Format looks like a Voter ID / EPIC number",
    normalized: cleaned,
  };
}
