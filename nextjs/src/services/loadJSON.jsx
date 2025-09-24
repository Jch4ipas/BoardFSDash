"use client";

export async function loadData() {
  try {
    const response = await fetch(`/api/jsonConfig`);
    if (!response.ok) {
        throw new Error(`Response status: ${response}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des événements :",error.message);
    return [];
  }
}