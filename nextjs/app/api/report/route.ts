import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session.user as any).id || "dev-user";
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  try {
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
    let url = `${pythonApiUrl}/api/report`;
    if (month) {
      url += `?month=${month}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${userId}`,
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
