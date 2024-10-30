import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 保護されたルートのパスパターン
  const protectedPaths = ["/dashboard", "/profile", "/settings"];

  // 現在のパスが保護されたルートかチェック
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtectedPath) {
    const response = await fetch(
      `${process.env.AUTH_SERVICE_URL}/auth/validate`,
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      },
    );

    if (!response.ok) {
      // ログインページにリダイレクト
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
};
