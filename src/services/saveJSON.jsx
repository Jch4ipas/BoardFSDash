"use client";

/**
 * Save the dashboard config with optimistic concurrency.
 * @param {any[]} data - the full config to persist.
 * @param {string|null} version - the version from the last load; sent in the
 *   body so the server can reject a stale (conflicting) save.
 * @returns {Promise<{ ok: boolean, conflict: boolean, version?: string|null }>}
 */
export async function saveData(data, version) {
  try {
    const response = await fetch(`/api/jsonConfig`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version, data }),
    });
    if (response.status === 409) {
      return { ok: false, conflict: true };
    }
    if (!response.ok) {
      return { ok: false, conflict: false };
    }
    const body = await response.json().catch(() => ({}));
    return { ok: true, conflict: false, version: body.version ?? null };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données :", error.message);
    return { ok: false, conflict: false };
  }
}
