import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session.user as any).id || "dev-user";
  const timestamp = Date.now().toString();
  const secret = process.env.INTERNAL_API_SECRET || "";
  
  // Calculate request integrity signature using HMAC-SHA256
  const message = `${userId}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  try {
    const formData = await req.formData();
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
    
    const response = await fetch(`${pythonApiUrl}/api/scan`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${userId}`,
        "X-Signature": signature,
        "X-Timestamp": timestamp,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: errText }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Scan API Proxy Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
