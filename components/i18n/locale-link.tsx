"use client";

import Link from "next/link";
import * as React from "react";
import { usePathname } from "next/navigation";
import {
  localeFromPathname,
  withLocalePrefix,
  type AppLocale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Link> & {
  /** Force locale; default = current path locale */
  locale?: AppLocale;
};

/**
 * Link that preserves /hi prefix when user is on Hindi routes.
 */
export function LocaleLink({ href, locale, className, ...rest }: Props) {
  const pathname = usePathname() || "/";
  const current = locale ?? localeFromPathname(pathname);
  const raw = typeof href === "string" ? href : href.pathname || "/";
  const nextHref =
    typeof href === "string"
      ? withLocalePrefix(raw, current)
      : { ...href, pathname: withLocalePrefix(raw, current) };

  return <Link href={nextHref} className={cn(className)} {...rest} />;
}
