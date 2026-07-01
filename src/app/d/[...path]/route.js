export const dynamic = "force-dynamic";

import { resolveInstance, safeHeaders, proxyPrefix } from "@/lib/grafana-proxy-utils";

/**
 * Builds the JS intercept script injected into every Grafana HTML page.
 * Rewrites all relative/absolute fetch, XHR and SystemJS calls to go through
 * our proxy prefix, so the Bearer token is added server-side.
 * @param {string} prefix - e.g. /api/grafana-proxy/i/{instanceId}
 * @returns {string}
 */
function buildInterceptScript(prefix) {
  return `<script>(function(){
  var p=${JSON.stringify(prefix)};
  function rw(u){
    if(!u)return u;
    if(u instanceof URL)u=u.href;
    if(typeof u!=="string")return u;
    var o=window.location.origin;
    if(u.startsWith("/")&&!u.startsWith(p))return p+u;
    if(u.startsWith(o+"/")&&!u.slice(o.length).startsWith(p))return o+p+u.slice(o.length);
    return u;
  }
  var F=window.fetch;
  window.fetch=function(u,c){
    if(u instanceof Request){var url=rw(u.url);if(url!==u.url)u=new Request(url,u);}
    else u=rw(u);
    return F.call(this,u,c);
  };
  var X=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(m,u){arguments[1]=rw(u);return X.apply(this,arguments);};
  function patchSystem(){
    if(window.System&&window.System.constructor){
      var proto=window.System.constructor.prototype;
      if(proto.resolve&&!proto._rw){
        proto._rw=true;var orig=proto.resolve;
        proto.resolve=function(id,p2){var r=orig.call(this,id,p2);return typeof r==="string"?rw(r):r;};
      }
    }
  }
  patchSystem();
  new MutationObserver(patchSystem).observe(document.documentElement,{childList:true,subtree:true});
})()</script>`;
}

/**
 * Rewrites a Grafana HTML page so all asset URLs go through our proxy.
 * Also patches the SystemJS import map so plugins load via the proxy.
 * See https://github.com/WICG/import-maps for the importmap spec.
 * @param {string} html
 * @param {string} prefix
 * @returns {string}
 */
function rewriteHtml(html, prefix) {
  // Rewrite src/href/action attributes pointing to absolute paths
  html = html.replace(
    /(\s(?:src|href|action)=["'])\/(?!\/)/g,
    `$1${prefix}/`
  );

  // Rewrite SystemJS import map values
  html = html.replace(
    /(<script[^>]*type=["'](?:systemjs-)?importmap["'][^>]*>)([\s\S]*?)(<\/script>)/gi,
    (_, open, content, close) => {
      try {
        const map = JSON.parse(content);
        const rw = (obj) => Object.fromEntries(
          Object.entries(obj || {}).map(([k, v]) => [
            k,
            typeof v === "string" && v.startsWith("/") && !v.startsWith(prefix)
              ? prefix + v
              : v,
          ])
        );
        if (map.imports) map.imports = rw(map.imports);
        return open + JSON.stringify(map) + close;
      } catch {
        return open + content + close;
      }
    }
  );

  // Inject intercept script as first child of <head>
  return html.replace(/(<head[^>]*>)/i, `$1${buildInterceptScript(prefix)}`);
}

export async function GET(request, { params }) {
  const searchParams = new URL(request.url).searchParams;
  const instanceId = searchParams.get("_gi") || null;
  const instance = await resolveInstance(instanceId);

  if (!instance) {
    return new Response("Grafana non configuré", { status: 500 });
  }

  const { path } = await params;
  searchParams.delete("_gi");
  const qs = searchParams.size ? `?${searchParams}` : "";
  const targetUrl = `${instance.url}/d/${path.join("/")}${qs}`;

  let res;
  try {
    res = await fetch(targetUrl, {
      headers: { Authorization: `Bearer ${instance.token}` },
      redirect: "follow",
    });
  } catch (e) {
    return new Response(`Erreur proxy : ${e.message}`, { status: 502 });
  }

  const headers = safeHeaders(res.headers);
  const ct = res.headers.get("content-type") || "";

  if (ct.includes("text/html")) {
    const prefix = proxyPrefix(instanceId);
    const html = rewriteHtml(await res.text(), prefix);
    headers.set("content-type", "text/html; charset=utf-8");
    return new Response(html, { status: res.status, headers });
  }

  return new Response(res.body, { status: res.status, headers });
}
