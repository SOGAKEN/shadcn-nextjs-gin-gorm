import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // セッションIDをクッキーから取得
  const sessionId = request.cookies.get("session_id")?.value;

  // セッションIDがない場合はログインページにリダイレクト
  if (!sessionId) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // セッションの有効性をチェックするためのリクエストをAuth Serviceに送信
  return validateSession(sessionId, request);
}

async function validateSession(sessionId: string, request: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.AUTH_SERVICE_URL}/validate-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      },
    );

    // セッションが無効な場合はログインページにリダイレクト
    if (!response.ok) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // セッションが有効な場合はリクエストをそのまま続行
    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// ミドルウェアを適用するルートの設定
export const config = {
  matcher: [
    "/dashboard/:path*", // ダッシュボードページなど、認証が必要なルートを指定
    "/profile/:path*", // 他の認証が必要なページも追加可能
  ],
};
