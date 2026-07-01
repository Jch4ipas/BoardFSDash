/**
 * Aggregates the EPFL gel API into a single response for the freeze component.
 *
 * Why a server-side proxy: avoids CORS issues for the client, lets us merge
 * multiple EPFL calls into one round-trip, and hides the upstream URL from
 * the browser.
 * https://agla.epfl.ch/api/gel
 */
export const dynamic = "force-dynamic";

const BASE = "https://agla.epfl.ch/api/gel";

/**
 * Fetches one path from the EPFL gel API.
 * Returns null on network errors or non-OK responses so callers degrade gracefully.
 *
 * @param {string} path - e.g. "" (today), "/next", "/2026-09-01"
 * @returns {Promise<object|null>}
 */
async function fetchGel(path = "") {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

/**
 * Returns "YYYY-MM-DD" for the UTC calendar day following an ISO date string.
 * Used to probe for a freeze starting immediately after a known period ends.
 *
 * @param {string} isoDate
 * @returns {string}
 */
function dayAfter(isoDate) {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Extracts the fields the component needs from any gel API response object.
 *
 * @param {object} data
 * @returns {{name: string, from: string, until: string}}
 */
function toFreeze(data) {
  return { name: data.name, from: data.from, until: data.until };
}

/**
 * Returns {current, next} where both are nullable freeze objects {name, from, until}.
 *
 * When in a freeze, /api/gel/next echoes the current period.
 * In that case we probe the day after `current.until` to surface the real next one —
 * this works for back-to-back freezes; gaps of days/weeks remain invisible to the API.
 */
export async function GET() {
  const [today, nextRaw] = await Promise.all([fetchGel(), fetchGel("/next")]);

  const current = today?.gel ? toFreeze(today) : null;
  let next = null;

  if (nextRaw) {
    const candidate = toFreeze(nextRaw);
    if (current && candidate.from === current.from) {
      // /next returned the active freeze — probe for one starting right after
      const probe = await fetchGel(`/${dayAfter(current.until)}`);
      if (probe?.gel) next = toFreeze(probe);
    } else {
      next = candidate;
    }
  }

  return Response.json({ current, next });
}
