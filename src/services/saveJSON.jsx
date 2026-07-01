"use client";

/**
 * Save the dashboard config with optimistic concurrency.
 * @param {any[]} data - the full config to persist.
 * @param {string|null} version - the ETag from the last load; sent as
 *   `If-Match` so the server can reject a stale (conflicting) save.
 * @returns {Promise<{ ok: boolean, conflict: boolean, version?: string|null }>}
 */
export async function saveData(data, version) {
  try {
    const response = await fetch(`/api/jsonConfig`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(version ? { "If-Match": version } : {}),
      },
      body: JSON.stringify(data),
    });
    if (response.status === 409) {
      return { ok: false, conflict: true };
    }
    if (!response.ok) {
      return { ok: false, conflict: false };
    }
    return { ok: true, conflict: false, version: response.headers.get("ETag") };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données :", error.message);
    return { ok: false, conflict: false };
  }
}
