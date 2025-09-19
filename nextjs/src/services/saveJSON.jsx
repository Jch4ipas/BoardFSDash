"use server";

import fs from "fs";
import path from "path";

export async function saveData(data) {
    const dirPath = path.join(process.cwd(), "data");
    const filePath = path.join(dirPath, "data.json");
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
}
