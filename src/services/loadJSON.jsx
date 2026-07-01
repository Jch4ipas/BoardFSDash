"use client";

/**
 * Load the dashboard config.
 * @returns {Promise<{ data: any[], version: string|null }>}
 *   `version` is the ETag used for optimistic concurrency on save.
 */
export async function loadData() {
  try {
    const response = await fetch(`/api/jsonConfig`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const version = response.headers.get("ETag");
    const data = await response.json();
    return { data, version };
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error.message);
    return { data: [], version: null };
  }
}
