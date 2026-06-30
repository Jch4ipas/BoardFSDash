import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { notifyClients } from "../events/route";
import { auth } from "@/services/auth";

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "data.json");
  if (!fs.existsSync(filePath)) {
    console.log("pas bien")
    return NextResponse.json([], { 
      status: 500,
      statusText: "No dashboard configuration found",
      headers: { "Content-Type": "application/json" }
     });
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return new Response(raw, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const dirPath = path.join(process.cwd(), "data");
    const filePath = path.join(dirPath, "data.json");
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2));
    notifyClients();
    return NextResponse.json({ success: true });
}