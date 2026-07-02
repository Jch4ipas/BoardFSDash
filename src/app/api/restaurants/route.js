/**
 * Server-side proxy for the EPFL restaurants / menus API.
 *
 * The upstream API is authenticated (HTTP Basic) and returns the day's menus
 * for every campus cafeteria. Credentials MUST stay server-side, so the
 * browser only ever talks to this route.
 *
 * Reuses the same source as the "Où sont les frites?" project (~/dev/oslf),
 * but keeps every restaurant (no fries filter). Configure via env:
 *   EPFL_MENU_API_URL       (falls back to API_URL)
 *   EPFL_MENU_API_USER      (falls back to API_USERNAME)
 *   EPFL_MENU_API_PASSWORD  (falls back to API_PASSWORD)
 *
 * Query params: lang (fr|en).
 */
const API_URL = process.env.EPFL_MENU_API_URL;
const API_USER = process.env.EPFL_MENU_API_USER;
const API_PASSWORD = process.env.EPFL_MENU_API_PASSWORD;

/** Pick the localized recipe name, falling back to the default one. */
function recipeName(recipe, lang) {
  if (!recipe) return null;
  return lang === "en" && recipe.name_en ? recipe.name_en : recipe.name;
}

export async function GET(request) {
  if (!API_URL || !API_USER || !API_PASSWORD) {
    return Response.json(
      { error: "Restaurants API not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") === "en" ? "en" : "fr";
  const date = new Date().toISOString().split("T")[0];

  try {
    const auth = Buffer.from(`${API_USER}:${API_PASSWORD}`).toString("base64");
    // Menus change once a day — cache upstream for 30 minutes.
    const res = await fetch(`${API_URL}?date=${date}`, {
      headers: { Authorization: `Basic ${auth}` },
      next: { revalidate: 1800 },
    });
    if (!res.ok) {
      return Response.json({ error: "Restaurants API error" }, { status: 502 });
    }

    const cafeterias = await res.json();
    const restaurants = (Array.isArray(cafeterias) ? cafeterias : [])
      .map((c) => ({
        id: c.id,
        name: c.name,
        address: c.address,
        urlSite: c.urlSite || null,
        urlLocation: c.urlLocation || null,
        menus: (c.menuLines || [])
          .map((line) => {
            const meal = (line.meals || [])[0];
            const items = meal?.items || [];
            const main = items.find((i) => i.menuSection === "mainCourse")?.recipe;
            // Prefer the main course, else the first item; expose its food type.
            const chosen = main || items[0]?.recipe || null;
            const dish = recipeName(chosen, lang);
            const price = meal?.prices?.[0];
            return {
              menuId: line.id,
              menuName: line.name,
              dish,
              category: chosen?.category || null,
              price: price?.price || null,
              currency: (price?.currency || "CHF").toUpperCase(),
              nutriScore: meal?.evaluation?.nutriScore || null,
            };
          })
          .filter((m) => m.dish),
      }))
      .filter((r) => r.menus.length > 0);

    return Response.json({ restaurants });
  } catch {
    return Response.json({ error: "Restaurants API unreachable" }, { status: 502 });
  }
}
