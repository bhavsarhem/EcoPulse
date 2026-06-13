import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session.user as any).id || "dev-user";
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
    const response = await fetch(`${pythonApiUrl}/api/history`, {
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
    console.error("History GET API Proxy Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session.user as any).id || "dev-user";
  const { searchParams } = new URL(req.url);
  const scanId = searchParams.get("scanId");

  if (!scanId) {
    return NextResponse.json({ error: "Missing scanId parameter" }, { status: 400 });
  }

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
    const response = await fetch(`${pythonApiUrl}/api/history/${scanId}`, {
      method: "DELETE",
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
    console.error("History DELETE API Proxy Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
