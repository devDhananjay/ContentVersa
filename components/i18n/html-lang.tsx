"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { localeFromPathname, htmlLang } from "@/lib/i18n/config";

/** Keeps <html lang> in sync with /hi prefix without restructuring root layout. */
export function HtmlLangSync() {
  const pathname = usePathname() || "/";
  React.useEffect(() => {
    const locale = localeFromPathname(pathname);
    document.documentElement.lang = htmlLang(locale);
  }, [pathname]);
  return null;
}
