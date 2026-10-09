import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { WorkForm } from "@/components/WorkForm";
import { createWork } from "../../actions";

async function NewWorkContent({ searchParams }: PageProps<"/dashboard/works/new">) {
  const session = await requireRole("photographer_pending");
  if (session.user.role === "photographer_pending") redirect("/pending");
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">← 回後台</Link>
      <h1 className="mt-2 text-2xl font-bold">新增作品</h1>
      <p className="mt-1 text-sm text-gray-500">填好作品資訊後送出審核，通過後會顯示在作品頁。</p>

      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <WorkForm action={createWork} submitLabel="送出審核" />

        <aside className="h-fit rounded-2xl border bg-gray-50 p-5 text-sm">
          <h2 className="font-bold">審核流程</h2>
          <ol className="mt-3 space-y-3">
            {[["1", "送出作品", "狀態會顯示「審核中」"], ["2", "審核員檢視", "通過後會公開在作品頁"], ["3", "若被退回", "後台會顯示退回原因，修改後可重新送出"]].map(([n, t, d]) => (
              <li key={n} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs text-white">{n}</span>
                <span><span className="font-medium">{t}</span><span className="block text-gray-500">{d}</span></span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  );
}

export default function NewWorkPage(props: PageProps<"/dashboard/works/new">) {
  return (
    <Suspense>
      <NewWorkContent {...props} />
    </Suspense>
  );
}
