import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 保護されたルートを定義
  const protectedPaths = ["/dashboard"];
  const isPathProtected = protectedPaths.some((protectedPath) =>
    path.startsWith(protectedPath),
  );

  if (isPathProtected) {
    const token = await getToken({ req: request });
    if (!token) {
      const url = new URL(`/login`, request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
