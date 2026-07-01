import { getInstanceById } from "./grafana-instances.js";

// Headers that prevent iframe embedding or expose server internals
const UNSAFE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "strict-transport-security",
]);

/**
 * Strips headers that would block iframe embedding, then returns a clean copy.
 * @param {Headers} src
 * @returns {Headers}
 */
export function safeHeaders(src) {
  const h = new Headers();
  for (const [k, v] of src) {
    if (!UNSAFE_HEADERS.has(k.toLowerCase())) h.set(k, v);
  }
  return h;
}

/**
 * Resolves Grafana credentials from a stored instance or environment variables.
 * Returns null when neither source is configured.
 * @param {string|null} instanceId
 * @returns {Promise<{url: string, token: string}|null>}
 */
export async function resolveInstance(instanceId) {
  if (instanceId) {
    const inst = await getInstanceById(instanceId);
    return inst ? { url: inst.url, token: inst.token } : null;
  }
  const url = process.env.NEXT_PUBLIC_GRAFANA_URL;
  const token = process.env.GRAFANA_TOKEN;
  return url && token ? { url, token } : null;
}

/**
 * Returns the proxy path prefix for a given instance.
 *
 * Embedding the instanceId in the path (not as a query param) is critical:
 * SystemJS resolves plugin chunk URLs relative to the parent module URL.
 * A relative `./chunk.js` from `.../i/{id}/public/plugins/foo/module.js`
 * resolves to `.../i/{id}/public/plugins/foo/chunk.js` — the id is preserved.
 * A query param would be lost during relative resolution.
 *
 * @param {string|null} instanceId
 * @returns {string}
 */
export function proxyPrefix(instanceId) {
  return instanceId
    ? `/api/grafana-proxy/i/${instanceId}`
    : "/api/grafana-proxy";
}
