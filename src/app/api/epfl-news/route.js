/**
 * Server-side proxy for the EPFL news API (https://actu.epfl.ch/api/v1/news/).
 *
 * Why proxy: avoids CORS in the browser, trims the (large) upstream payload
 * down to the fields the widget needs, and lets us cache the response so the
 * public display doesn't hammer the EPFL API.
 *
 * Query params: lang (fr|en|de), limit (1..20), channel (optional id).
 */
const BASE = "https://actu.epfl.ch/api/v1/news/";

/** Turn the HTML snippets the API returns into plain, single-line text. */
function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&(#39|rsquo|lsquo|apos);/g, "'")
    .replace(/&quot;|&(laquo|raquo|ldquo|rdquo);/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lang = ["fr", "en", "de"].includes(searchParams.get("lang"))
    ? searchParams.get("lang")
    : "fr";
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit"), 10) || 8, 1), 20);
  const channel = searchParams.get("channel");

  const upstream = new URL(BASE);
  upstream.searchParams.set("format", "json");
  upstream.searchParams.set("lang", lang);
  upstream.searchParams.set("limit", String(limit));
  if (channel) upstream.searchParams.set("channel", channel);

  try {
    // Cache the upstream news for 10 minutes (news changes slowly).
    const res = await fetch(upstream, { next: { revalidate: 600 } });
    if (!res.ok) {
      return Response.json({ error: "EPFL actu API error" }, { status: 502 });
    }
    const json = await res.json();
    const items = (json.results || []).map((n) => ({
      id: n.id,
      title: n.title,
      subtitle: stripHtml(n.subtitle),
      date: n.publish_date,
      image: n.visual_url || n.thumbnail_url || null,
      url: n.news_url,
      channel: n.channel?.name || null,
      category: n.category?.[`${lang}_label`] || n.category?.en_label || null,
    }));
    return Response.json({ items });
  } catch {
    return Response.json({ error: "EPFL actu API unreachable" }, { status: 502 });
  }
}
