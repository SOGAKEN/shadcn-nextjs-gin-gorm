// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    // Auth Serviceにリクエストを送信
    const authResponse = await fetch(`${process.env.AUTH_SERVICE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      return NextResponse.json(
        { error: errorData.error || "Invalid login" },
        { status: 401 },
      );
    }

    // Auth Serviceからsession_idクッキーを取得
    const authHeaders = authResponse.headers;
    const setCookieHeader = authHeaders.get("set-cookie");
    if (setCookieHeader) {
      const response = NextResponse.json({ message: "Login successful" });
      response.headers.set("Set-Cookie", setCookieHeader); // クッキーを設定
      return response;
    } else {
      return NextResponse.json(
        { error: "Session cookie not found" },
        { status: 500 },
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
