/**
 * Cookie-based locale management for the backoffice.
 *
 * Why cookies instead of URL prefixes (/fr/admin): the dashboard URL must stay
 * clean (/admin) so iframe embeds and direct links remain stable. The locale
 * preference is a UI concern, not a resource identifier.
 * https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing
 */
"use server";

import { cookies, headers } from "next/headers";
import { locales, defaultLocale } from "@/constants/i18n";

const COOKIE = "NEXT_LOCALE";

/**
 * Returns the active locale, resolved in priority order:
 *   1. Stored cookie
 *   2. Browser Accept-Language header
 *   3. defaultLocale ("fr")
 *
 * @returns {Promise<string>}
 */
export async function getUserLocale() {
  const cookieStore = await cookies();
  const stored = cookieStore.get(COOKIE)?.value;
  if (stored && locales.includes(stored)) return stored;

  const acceptLang = (await headers()).get("accept-language") ?? "";
  const preferred = acceptLang
    .split(",")
    .map((l) => l.split(";")[0].trim().slice(0, 2));
  return preferred.find((l) => locales.includes(l)) ?? defaultLocale;
}

/**
 * Persists the chosen locale in a cookie so subsequent requests pick it up.
 *
 * @param {string} locale
 */
export async function setUserLocale(locale) {
  (await cookies()).set(COOKIE, locale, { path: "/" });
}
