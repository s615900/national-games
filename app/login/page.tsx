import { signIn } from "@/auth";

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
    </main>
  );
}
