import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.AUTH_SERVICE_URL}/auth/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Logout failed" },
        { status: response.status },
      );
    }

    // クッキーを削除
    cookies().delete("access_token");
    cookies().delete("refresh_token");

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
