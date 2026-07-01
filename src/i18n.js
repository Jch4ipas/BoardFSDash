/**
 * next-intl per-request configuration.
 * Loaded by the plugin defined in next.config.mjs.
 * https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing#i18nts
 */
import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/lib/locale";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
