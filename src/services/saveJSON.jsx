"use client";

export async function saveData(data) {
  try {
    const response = await fetch(`/api/jsonConfig`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
      return false;
    } else if (response.ok) {
        return true;
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données :", error.message);
    return false;
  }
}