export const dynamic = "force-dynamic";

import { resolveInstance, safeHeaders, proxyPrefix } from "@/lib/grafana-proxy-utils";

/**
 * Proxies any Grafana asset or API call with the appropriate Bearer token.
 *
 * Instance routing via path:
 *   /api/grafana-proxy/i/{instanceId}/public/... → file-based instance
 *   /api/grafana-proxy/public/...               → env-var fallback
 *
 * Embedding the instanceId in the path (segment "i") is intentional:
 * SystemJS resolves relative chunk URLs relative to the parent module URL,
 * so the instanceId is preserved without extra query params.
 */
async function handle(request, params, method) {
  const { path } = await params;

  // Detect instance routing: path starts with ["i", instanceId, ...]
  let instanceId = null;
  let grafanaPath;
  if (path[0] === "i" && path.length > 2) {
    instanceId = path[1];
    grafanaPath = path.slice(2).join("/");
  } else {
    grafanaPath = path.join("/");
  }

  const instance = await resolveInstance(instanceId);
  if (!instance) return new Response("Grafana non configuré", { status: 500 });

  const qs = new URL(request.url).search;
  const targetUrl = `${instance.url}/${grafanaPath}${qs}`;

  const reqHeaders = new Headers({ Authorization: `Bearer ${instance.token}` });
  for (const key of ["content-type", "accept", "accept-language"]) {
    const v = request.headers.get(key);
    if (v) reqHeaders.set(key, v);
  }

  let body;
  if (method !== "GET" && method !== "HEAD") {
    const buf = await request.arrayBuffer();
    if (buf.byteLength) body = buf;
  }

  let res;
  try {
    res = await fetch(targetUrl, { method, headers: reqHeaders, body, redirect: "follow" });
  } catch (e) {
    return new Response(`Erreur proxy : ${e.message}`, { status: 502 });
  }

  const resHeaders = safeHeaders(res.headers);
  const ct = res.headers.get("content-type") || "";

  // Rewrite absolute url() references in CSS so fonts/images go through the proxy
  if (ct.includes("text/css")) {
    const prefix = proxyPrefix(instanceId);
    const css = (await res.text()).replace(
      /url\(\s*["']?(\/(?!\/)[^"')]+)["']?\s*\)/g,
      (_, p) => `url(${prefix}${p})`
    );
    resHeaders.set("content-type", ct);
    return new Response(css, { status: res.status, headers: resHeaders });
  }

  return new Response(res.body, { status: res.status, headers: resHeaders });
}

export const GET    = (req, { params }) => handle(req, params, "GET");
export const POST   = (req, { params }) => handle(req, params, "POST");
export const PUT    = (req, { params }) => handle(req, params, "PUT");
export const DELETE = (req, { params }) => handle(req, params, "DELETE");
export const PATCH  = (req, { params }) => handle(req, params, "PATCH");
