import { headers, cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/config";

export async function getRequestLocale(): Promise<AppLocale> {
  const h = await headers();
  const fromHeader = h.get(LOCALE_HEADER);
  if (isAppLocale(fromHeader)) return fromHeader;

  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (isAppLocale(fromCookie)) return fromCookie;

  return DEFAULT_LOCALE;
}
