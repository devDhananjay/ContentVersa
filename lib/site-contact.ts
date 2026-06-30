export const CONTACT_EMAIL = "writewith@contentverses.in";

/** Legacy typo stored in older DB site-page rows. */
export const LEGACY_CONTACT_EMAIL = "writewith@contentveres.in";

export function normalizeContactEmail(text: string): string {
  return text.replace(/writewith@contentveres\.in/gi, CONTACT_EMAIL);
}

export const CONTACT_PHONE = "+919411441937";
export const CONTACT_PHONE_DISPLAY = "+91 94114 41937";
