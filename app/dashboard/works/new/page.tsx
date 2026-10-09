import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { sports } from "@/lib/sports";
import { createWork } from "../../actions";

const field = "mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}{required && <span className="text-red-600"> *</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

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
        <form action={createWork} className="space-y-8 rounded-2xl border bg-white p-6 shadow-sm">
          <section className="space-y-4">
            <h2 className="font-bold">基本資訊</h2>
            <Field label="作品標題" required><input name="title" required maxLength={50} placeholder="例：最後一百公尺的衝刺" className={field} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="運動項目" required>
                <select name="sport" required defaultValue="" className={field}>
                  <option value="" disabled>請選擇</option>
                  {sports.map((s) => <option key={s.slug} value={s.slug}>{s.emoji} {s.name}</option>)}
                </select>
              </Field>
              <Field label="拍攝日期" required><input name="date" type="date" required className={field} /></Field>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold">賽事資訊</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="賽事名稱"><input name="event" maxLength={50} placeholder="例：115 年全國田徑錦標賽" className={field} /></Field>
              <Field label="拍攝地點"><input name="location" maxLength={50} placeholder="例：高雄國家體育場" className={field} /></Field>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold">作品說明</h2>
            <Field label="拍攝故事、器材等" hint="選填，最多 500 字"><textarea name="description" maxLength={500} rows={5} className={field} /></Field>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold">作品照片</h2>
            <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              <span className="text-3xl">🖼️</span>
              <p className="mt-2 font-medium text-gray-700">照片上傳即將開放</p>
              <p className="mt-1">現在可以先送出作品資訊，之後再補照片。</p>
            </div>
          </section>

          <div className="flex items-center gap-3 border-t pt-6">
            <button className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800">送出審核</button>
            <Link href="/dashboard" className="rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100">取消</Link>
          </div>
        </form>

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
