"use client";

/**
 * Load the dashboard config.
 * @returns {Promise<{ data: any[], version: string|null }>}
 *   `version` is used for optimistic concurrency on save (carried in the
 *   body, not the ETag header, so proxies can't rewrite it).
 */
export async function loadData() {
  try {
    const response = await fetch(`/api/jsonConfig`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const body = await response.json();
    return { data: body.data ?? [], version: body.version ?? null };
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error.message);
    return { data: [], version: null };
  }
}
