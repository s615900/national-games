import { Suspense } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { listWorksForBackend } from "@/lib/data";
import { getSport } from "@/lib/sports";
import { WORK_STATUS, btnDanger, btnGhost, btnOutline, card } from "@/lib/ui";
import { approveWork, rejectWork } from "./actions";

async function ReviewPageContent({ searchParams }: PageProps<"/review">) {
  const session = await requireRole("reviewer");
  const sp = await searchParams;
  const tab = typeof sp.status === "string" && sp.status in WORK_STATUS ? sp.status : "pending";
  const all = await listWorksForBackend({});
  const count = (s: string) => all.filter((w) => w.status === s).length;
  const shown = all.filter((w) => w.status === tab);
  const tabs = [["pending", "待審核"], ["approved", "已通過"], ["rejected", "已退回"]] as const;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className={`${card} flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between`}>
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">← 回後台</Link>
          <h1 className="mt-1 text-2xl font-bold">審核作品</h1>
          <p className="mt-1 text-sm text-gray-500">{count("pending") > 0 ? `有 ${count("pending")} 件作品等待審核` : "目前沒有待審核的作品"}</p>
        </div>
        {session.user.role === "admin" && <Link href="/admin/users" className={btnOutline}>帳號管理</Link>}
      </header>

      <section className="grid grid-cols-3 gap-3">
        {tabs.map(([key, label]) => (
          <div key={key} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${WORK_STATUS[key].num}`}>{count(key)}</p>
          </div>
        ))}
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
          <h2 className="text-lg font-bold">作品清單</h2>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 text-sm">
            {tabs.map(([key, label]) => (
              <Link key={key} href={`/review?status=${key}`} className={`rounded-md px-3 py-1 transition ${tab === key ? "bg-white font-medium shadow-sm" : "text-gray-600 hover:text-black"}`}>
                {label} <span className="text-gray-400">{count(key)}</span>
              </Link>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-4xl">{tab === "pending" ? "🎉" : "📂"}</p>
            <p className="mt-3 font-medium">{tab === "pending" ? "全部審核完了" : "這裡還沒有作品"}</p>
            <p className="mt-1 text-sm text-gray-500">{tab === "pending" ? "有新作品送出時會顯示在這裡。" : "切換上方的分類看看。"}</p>
          </div>
        ) : (
          <ul className="divide-y">
            {shown.map((w) => {
              const sport = getSport(w.sport);
              return (
                <li key={w.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start">
                  <div className={`flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${sport?.color ?? "from-gray-300 to-gray-500"} text-3xl`}>{sport?.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{w.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{[sport?.name, w.event || "未填賽事", w.location || "未填地點", w.date].join("・")}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      攝影師：<Link href={`/photographers/${w.photographerId}`} className="text-gray-800 underline">{w.photographerName || "（未命名）"}</Link>
                    </p>
                    {w.description && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm">{w.description}</p>}
                    {w.status === "rejected" && w.rejectReason && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"><span className="font-medium">退回原因：</span>{w.rejectReason}</p>}

                    {w.status === "pending" && (
                      <div className="mt-3 flex flex-wrap items-start gap-2">
                        <form action={approveWork}>
                          <input type="hidden" name="id" value={w.id} />
                          <button className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">✓ 通過</button>
                        </form>
                        <details className="group">
                          <summary className={`${btnOutline} cursor-pointer list-none text-red-600`}>退回…</summary>
                          <form action={rejectWork} className="mt-2 w-72 space-y-2 rounded-xl border bg-white p-3 shadow-lg">
                            <input type="hidden" name="id" value={w.id} />
                            <label className="block text-sm font-medium">退回原因 <span className="text-red-600">*</span>
                              <textarea name="reason" required maxLength={200} rows={3} placeholder="請說明哪裡需要修改，攝影師會在後台看到" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10" />
                            </label>
                            <button className={`${btnDanger} w-full justify-center`}>確定退回</button>
                          </form>
                        </details>
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${WORK_STATUS[w.status]?.badge}`}>{WORK_STATUS[w.status]?.label}</span>
                    {w.status === "approved" && <Link href={`/works/${w.id}`} className={btnGhost}>查看</Link>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function ReviewPage(props: PageProps<"/review">) {
  return (
    <Suspense>
      <ReviewPageContent {...props} />
    </Suspense>
  );
}
