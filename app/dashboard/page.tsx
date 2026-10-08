import { Suspense } from "react";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { requireRole } from "@/lib/guard";
import { hasRole } from "@/lib/roles";

async function DashboardPageContent() {
  const session = await requireRole("photographer_pending");
  const role = session.user.role!;
  if (role === "photographer_pending") redirect("/pending");

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">攝影師後台</h1>
      <p className="mt-2">你好，{session.user.name}（身分：{role}）</p>
      <p className="mt-4 text-gray-500">上傳作品功能將在下一階段加入。</p>
      <div className="mt-6 flex gap-4">
        {hasRole(role, "reviewer") && <a className="underline" href="/review">審核後台</a>}
        {hasRole(role, "admin") && <a className="underline" href="/admin/users">帳號管理</a>}
        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
          <button className="underline">登出</button>
        </form>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageContent />
    </Suspense>
  );
}
