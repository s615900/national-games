import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 只做「快速擋人」：沒有登入 cookie 就直接導到登入頁。
// 真正的權限檢查在各頁面的 requireRole()，不能只靠這裡。
export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has("authjs.session-token") || request.cookies.has("__Secure-authjs.session-token");
  if (!hasSession) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/review/:path*", "/pending"] };
