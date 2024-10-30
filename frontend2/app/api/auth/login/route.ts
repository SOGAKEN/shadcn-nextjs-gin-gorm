import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error },
        { status: response.status },
      );
    }

    // Auth Serviceからのクッキーを転送
    const authResponse = NextResponse.json(data);
    const responseCookies = response.headers.getSetCookie();

    responseCookies.forEach((cookie) => {
      const [name, ...rest] = cookie.split("=");
      const value = rest.join("=");
      cookies().set(name, value);
    });

    return authResponse;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
