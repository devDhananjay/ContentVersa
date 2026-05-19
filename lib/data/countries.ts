// Lightweight country list for the phone-OTP country picker. ISO 3166-1
// alpha-2 + E.164 dial code + flag emoji. Ordered with the most likely
// ContentVerse audiences first; the rest is alphabetical.

export interface Country {
  /** ISO 3166-1 alpha-2 code, e.g. "IN". */
  code: string;
  /** Country display name. */
  name: string;
  /** E.164 dial code WITHOUT the leading "+". */
  dial: string;
  /** Unicode flag emoji. */
  emoji: string;
}

export const COUNTRIES: Country[] = [
  { code: "IN", name: "India", dial: "91", emoji: "🇮🇳" },
  { code: "US", name: "United States", dial: "1", emoji: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "44", emoji: "🇬🇧" },
  { code: "CA", name: "Canada", dial: "1", emoji: "🇨🇦" },
  { code: "AU", name: "Australia", dial: "61", emoji: "🇦🇺" },
  { code: "AE", name: "United Arab Emirates", dial: "971", emoji: "🇦🇪" },
  { code: "SG", name: "Singapore", dial: "65", emoji: "🇸🇬" },
  { code: "DE", name: "Germany", dial: "49", emoji: "🇩🇪" },
  { code: "FR", name: "France", dial: "33", emoji: "🇫🇷" },
  { code: "BR", name: "Brazil", dial: "55", emoji: "🇧🇷" },
  { code: "JP", name: "Japan", dial: "81", emoji: "🇯🇵" },
  { code: "ID", name: "Indonesia", dial: "62", emoji: "🇮🇩" },
  { code: "PK", name: "Pakistan", dial: "92", emoji: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dial: "880", emoji: "🇧🇩" },
  { code: "NP", name: "Nepal", dial: "977", emoji: "🇳🇵" },
  { code: "LK", name: "Sri Lanka", dial: "94", emoji: "🇱🇰" },
  // Rest, alphabetical by name.
  { code: "AR", name: "Argentina", dial: "54", emoji: "🇦🇷" },
  { code: "AT", name: "Austria", dial: "43", emoji: "🇦🇹" },
  { code: "BE", name: "Belgium", dial: "32", emoji: "🇧🇪" },
  { code: "CH", name: "Switzerland", dial: "41", emoji: "🇨🇭" },
  { code: "CL", name: "Chile", dial: "56", emoji: "🇨🇱" },
  { code: "CN", name: "China", dial: "86", emoji: "🇨🇳" },
  { code: "CO", name: "Colombia", dial: "57", emoji: "🇨🇴" },
  { code: "CZ", name: "Czechia", dial: "420", emoji: "🇨🇿" },
  { code: "DK", name: "Denmark", dial: "45", emoji: "🇩🇰" },
  { code: "EG", name: "Egypt", dial: "20", emoji: "🇪🇬" },
  { code: "ES", name: "Spain", dial: "34", emoji: "🇪🇸" },
  { code: "FI", name: "Finland", dial: "358", emoji: "🇫🇮" },
  { code: "GR", name: "Greece", dial: "30", emoji: "🇬🇷" },
  { code: "HK", name: "Hong Kong", dial: "852", emoji: "🇭🇰" },
  { code: "IE", name: "Ireland", dial: "353", emoji: "🇮🇪" },
  { code: "IL", name: "Israel", dial: "972", emoji: "🇮🇱" },
  { code: "IT", name: "Italy", dial: "39", emoji: "🇮🇹" },
  { code: "KR", name: "South Korea", dial: "82", emoji: "🇰🇷" },
  { code: "MX", name: "Mexico", dial: "52", emoji: "🇲🇽" },
  { code: "MY", name: "Malaysia", dial: "60", emoji: "🇲🇾" },
  { code: "NG", name: "Nigeria", dial: "234", emoji: "🇳🇬" },
  { code: "NL", name: "Netherlands", dial: "31", emoji: "🇳🇱" },
  { code: "NO", name: "Norway", dial: "47", emoji: "🇳🇴" },
  { code: "NZ", name: "New Zealand", dial: "64", emoji: "🇳🇿" },
  { code: "PH", name: "Philippines", dial: "63", emoji: "🇵🇭" },
  { code: "PL", name: "Poland", dial: "48", emoji: "🇵🇱" },
  { code: "PT", name: "Portugal", dial: "351", emoji: "🇵🇹" },
  { code: "QA", name: "Qatar", dial: "974", emoji: "🇶🇦" },
  { code: "RO", name: "Romania", dial: "40", emoji: "🇷🇴" },
  { code: "RU", name: "Russia", dial: "7", emoji: "🇷🇺" },
  { code: "SA", name: "Saudi Arabia", dial: "966", emoji: "🇸🇦" },
  { code: "SE", name: "Sweden", dial: "46", emoji: "🇸🇪" },
  { code: "TH", name: "Thailand", dial: "66", emoji: "🇹🇭" },
  { code: "TR", name: "Türkiye", dial: "90", emoji: "🇹🇷" },
  { code: "TW", name: "Taiwan", dial: "886", emoji: "🇹🇼" },
  { code: "UA", name: "Ukraine", dial: "380", emoji: "🇺🇦" },
  { code: "VN", name: "Vietnam", dial: "84", emoji: "🇻🇳" },
  { code: "ZA", name: "South Africa", dial: "27", emoji: "🇿🇦" },
];

export const DEFAULT_COUNTRY: Country =
  COUNTRIES.find((c) => c.code === "IN") || COUNTRIES[0];
