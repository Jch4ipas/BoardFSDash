import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { notifyClients } from "../events/route";
import { auth } from "@/services/auth";

const filePath = path.join(process.cwd(), "data", "data.json");

/** Version stamp for optimistic concurrency: a hash of the stored config. */
function versionOf(raw) {
  return `"${crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16)}"`;
}

function readRaw() {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "[]";
}

export async function GET() {
  const raw = readRaw();
  return new Response(raw, {
    status: 200,
    headers: { "Content-Type": "application/json", ETag: versionOf(raw) },
  });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optimistic concurrency: reject if the config changed since the client
  // loaded it, so a stale save can't silently overwrite someone else's work.
  const ifMatch = request.headers.get("If-Match");
  const currentVersion = versionOf(readRaw());
  if (ifMatch && ifMatch !== currentVersion) {
    return NextResponse.json(
      { error: "conflict", currentVersion },
      { status: 409, headers: { ETag: currentVersion } },
    );
  }

  const body = await request.json();
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const newRaw = JSON.stringify(body, null, 2);
  fs.writeFileSync(filePath, newRaw);
  notifyClients();
  return NextResponse.json({ success: true }, { headers: { ETag: versionOf(newRaw) } });
}
