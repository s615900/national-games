import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { GoogleButton } from "@/components/GoogleButton";

export const metadata = { title: "註冊成為攝影師｜National Games" };

const STEPS = [
  ["用 Google 帳號註冊", "不用另外設定密碼，一鍵完成。"],
  ["填寫基本資料", "姓名、手機、所在地區、擅長運動，並上傳大頭貼。"],
  ["等待管理員核准", "我們會檢視你的資料，通常會盡快處理。"],
  ["開始投稿作品", "核准後就能新增作品，通過審核的作品會公開展示。"],
];

async function RegisterContent() {
  await connection();
  if ((await auth())?.user) redirect("/dashboard"); // 已經登入的人不用再註冊

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <p className="text-4xl">📷</p>
        <h1 className="mt-3 text-3xl font-bold">成為 National Games 攝影師</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">把你的運動攝影作品放上來，讓更多人看見。從田徑到棒球，從校園到全國賽事都歡迎。</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">註冊流程</h2>
          <ol className="mt-5 space-y-5">
            {STEPS.map(([title, desc], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">{i + 1}</span>
                <span><span className="font-semibold">{title}</span><span className="block text-sm text-gray-500">{desc}</span></span>
              </li>
            ))}
          </ol>
        </section>

        <aside className="h-fit space-y-4 rounded-2xl border bg-gray-50 p-6">
          <h2 className="text-lg font-bold">立即註冊</h2>
          <GoogleButton label="用 Google 註冊" />
          <p className="text-center text-sm text-gray-500">已經有帳號？<Link href="/login" className="font-medium text-black underline">直接登入</Link></p>
          <ul className="space-y-1.5 border-t pt-4 text-xs text-gray-500">
            <li>✓ 免費註冊</li>
            <li>✓ 手機和真實姓名不會公開，只有管理員審核時看得到</li>
            <li>✓ 作品著作權永遠屬於你</li>
          </ul>
          <p className="text-xs text-gray-500">註冊即表示你會在下一步閱讀並同意<Link href="/terms" className="underline">服務條款</Link>與<Link href="/privacy" className="underline">隱私權政策</Link>。</p>
        </aside>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
