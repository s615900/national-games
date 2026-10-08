import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { auth } from "@/auth";

// 登入後顯示「我的後台」，沒登入顯示登入按鈕（要讀登入狀態，所以包在 Suspense 裡）
async function AuthLink() {
  await connection();
  const session = await auth();
  return session?.user ? (
    <Link href="/dashboard" className="rounded-lg bg-black px-3 py-1.5 text-white">我的後台</Link>
  ) : (
    <Link href="/login" className="rounded-lg bg-black px-3 py-1.5 text-white">登入／註冊</Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold">📷 National Games</Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-6">
          <Link href="/works" className="hover:underline">作品</Link>
          <Link href="/photographers" className="hover:underline">攝影師</Link>
          <Suspense fallback={<span className="rounded-lg bg-gray-200 px-3 py-1.5 text-transparent">登入／註冊</span>}><AuthLink /></Suspense>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t py-8 text-center text-sm text-gray-500">
      © 2026 National Games・全台灣運動攝影師作品平台
    </footer>
  );
}
