import { devLoginEnabled, signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">登入 National Games</h1>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800">用 Google 登入</button>
      </form>
      {devLoginEnabled && (
        <form
          action={async () => {
            "use server";
            await signIn("dev", { redirectTo: "/dashboard" });
          }}
        >
          <button className="rounded-lg border border-dashed border-orange-500 px-6 py-3 text-orange-600">開發模式：免 Google 直接進後台</button>
          <p className="mt-2 text-center text-xs text-gray-500">只有本機看得到，正式網站不會出現</p>
        </form>
      )}
    </main>
  );
}
