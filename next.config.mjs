import createNextIntlPlugin from "next-intl/plugin";

/**
 * next-intl plugin wires up getRequestConfig from ./src/i18n.js.
 * No URL-based routing — locale is resolved from a cookie.
 * https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing
 */
const withNextIntl = createNextIntlPlugin("./src/i18n.js");

/** @type {import('next').NextConfig} */
const nextConfig = { output: "standalone" };

export default withNextIntl(nextConfig);