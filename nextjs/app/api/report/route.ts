import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session.user as any).id || "dev-user";
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  
  const timestamp = Date.now().toString();
  const secret = process.env.INTERNAL_API_SECRET || "";
  
  // Calculate signature
  const message = `${userId}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  try {
    const deviceId = req.cookies.get("device_id")?.value || "";
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";
    let url = `${pythonApiUrl}/api/report`;
    if (month) {
      url += `?month=${month}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${userId}`,
        "X-Signature": signature,
        "X-Timestamp": timestamp,
        "X-Device-Id": deviceId,
      },
    });
    
    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: errText }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Report API Proxy Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
