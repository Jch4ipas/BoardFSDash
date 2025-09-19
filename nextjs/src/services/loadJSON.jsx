"use server";

import fs from "fs";
import path from "path";

export async function loadData() {
  const filePath = path.join(process.cwd(), "data", "data.json");
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}