import Link from "next/link";
import { devLoginEnabled, signIn } from "@/auth";
import { GoogleButton } from "@/components/GoogleButton";

export const metadata = { title: "登入｜National Games" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-center text-4xl">📷</p>
        <h1 className="mt-3 text-center text-2xl font-bold">登入 National Games</h1>
        <p className="mt-1 text-center text-sm text-gray-500">攝影師、審核員、管理員請由此登入</p>
        <div className="mt-6">
          <GoogleButton label="用 Google 登入" />
        </div>
        <p className="mt-5 text-center text-sm text-gray-500">
          還沒有帳號？<Link href="/register" className="font-medium text-black underline">註冊成為攝影師</Link>
        </p>
      </div>

      {devLoginEnabled && (
        <div className="mt-4 flex flex-col gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("dev", { redirectTo: "/dashboard" });
            }}
          >
            <button className="w-full rounded-lg border border-dashed border-orange-500 px-6 py-3 text-sm text-orange-600">開發模式：管理員（免 Google）</button>
          </form>
          <form
            action={async () => {
              "use server";
              await signIn("dev-photographer", { redirectTo: "/dashboard" });
            }}
          >
            <button className="w-full rounded-lg border border-dashed border-orange-500 px-6 py-3 text-sm text-orange-600">開發模式：一般攝影師（免 Google）</button>
          </form>
          <p className="text-center text-xs text-gray-500">只有本機看得到，正式網站不會出現</p>
        </div>
      )}
    </main>
  );
}
