import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { notifyClients } from "../events/route";
import { auth } from "@/services/auth";

const filePath = path.join(process.cwd(), "data", "data.json");

/** Version stamp for optimistic concurrency: a hash of the stored config. */
function versionOf(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

function readRaw() {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "[]";
}

// The version travels in the JSON body (not the ETag/If-Match headers):
// proxies and gzip rewrite ETags (e.g. weak "W/" prefix), which broke the
// conflict check behind the OpenShift router. Bodies are never rewritten.
export async function GET() {
  const raw = readRaw();
  return NextResponse.json({ version: versionOf(raw), data: JSON.parse(raw) });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { version, data } = await request.json();

  // Optimistic concurrency: reject if the config changed since the client
  // loaded it, so a stale save can't silently overwrite someone else's work.
  const currentVersion = versionOf(readRaw());
  if (version && version !== currentVersion) {
    return NextResponse.json({ error: "conflict", currentVersion }, { status: 409 });
  }

  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const newRaw = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, newRaw);
  notifyClients();
  return NextResponse.json({ success: true, version: versionOf(newRaw) });
}
