"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { getDictionary, t, type Dictionary } from "@/lib/i18n/get-dictionary";
import { localeFromPathname, type AppLocale } from "@/lib/i18n/config";

export function useLocale(): AppLocale {
  const pathname = usePathname() || "/";
  return localeFromPathname(pathname);
}

export function useDictionary(): {
  locale: AppLocale;
  dict: Dictionary;
  t: (path: string, fallback?: string) => string;
} {
  const locale = useLocale();
  const dict = React.useMemo(() => getDictionary(locale), [locale]);
  const translate = React.useCallback(
    (path: string, fallback?: string) => t(dict, path, fallback),
    [dict]
  );
  return { locale, dict, t: translate };
}
