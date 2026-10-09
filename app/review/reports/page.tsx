import { Suspense } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";
import { listWorksForBackend } from "@/lib/data";
import { reasonLabel } from "@/lib/reports";
import { btnDanger, btnGhost, btnOutline, card } from "@/lib/ui";
import { dismissReport, takedownWork } from "./actions";

const TABS = [["open", "待處理"], ["resolved", "已下架"], ["dismissed", "已駁回"]] as const;
const field = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10";

async function ReportsPageContent({ searchParams }: PageProps<"/review/reports">) {
  await requireRole("reviewer");
  const sp = await searchParams;
  const tab = TABS.find(([k]) => k === sp.status)?.[0] ?? "open";
  const [reports, works] = await Promise.all([
    (await getDb()).collection("reports").find({}).sort({ createdAt: -1 }).toArray(),
    listWorksForBackend({}),
  ]);
  const byId = new Map(works.map((w) => [w.id, w]));
  const count = (s: string) => reports.filter((r) => r.status === s).length;
  const shown = reports.filter((r) => r.status === tab);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className={`${card} flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between`}>
        <div>
          <Link href="/review" className="text-sm text-gray-500 hover:text-black">← 回審核作品</Link>
          <h1 className="mt-1 text-2xl font-bold">檢舉處理</h1>
          <p className="mt-1 text-sm text-gray-500">{count("open") > 0 ? `有 ${count("open")} 筆檢舉等待處理` : "目前沒有待處理的檢舉"}</p>
        </div>
      </header>

      <section className={card}>
        <div className="flex flex-wrap gap-1 border-b px-6 py-4">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 text-sm">
            {TABS.map(([key, label]) => (
              <Link key={key} href={`/review/reports?status=${key}`} className={`rounded-md px-3 py-1 transition ${tab === key ? "bg-white font-medium shadow-sm" : "text-gray-600 hover:text-black"}`}>
                {label} <span className="text-gray-400">{count(key)}</span>
              </Link>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-4xl">{tab === "open" ? "🎉" : "📂"}</p>
            <p className="mt-3 font-medium">{tab === "open" ? "沒有待處理的檢舉" : "這裡還沒有紀錄"}</p>
          </div>
        ) : (
          <ul className="divide-y">
            {shown.map((r) => {
              const w = byId.get(r.workId);
              const id = r._id.toString();
              return (
                <li key={id} className="space-y-3 px-6 py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">{reasonLabel(r.reason)}</span>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</span>
                  </div>
                  <p className="text-sm">
                    被檢舉作品：
                    {w ? <Link href={w.status === "approved" ? `/works/${w.id}` : "/review"} className="font-medium underline">{w.title}</Link> : <span className="text-gray-400">（作品已刪除）</span>}
                    {w && <span className="text-gray-500">　攝影師：{w.photographerName || "（未命名）"}</span>}
                    {w && w.status !== "approved" && <span className="ml-2 text-xs text-amber-700">目前未公開</span>}
                  </p>
                  {r.detail && <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm">{r.detail}</p>}
                  <p className="text-xs text-gray-500">檢舉人：{r.contact || "未留聯絡方式"}{r.reporterId ? "（已登入）" : "（訪客）"}</p>

                  {r.status === "open" ? (
                    <div className="flex flex-wrap items-start gap-2">
                      {w && w.status === "approved" && (
                        <details>
                          <summary className={`${btnDanger} cursor-pointer list-none`}>下架作品…</summary>
                          <form action={takedownWork} className="mt-2 w-72 space-y-2 rounded-xl border bg-white p-3 shadow-lg">
                            <input type="hidden" name="workId" value={w.id} />
                            <label className="block text-sm font-medium">下架原因 <span className="text-red-600">*</span>
                              <textarea name="note" required maxLength={200} rows={3} placeholder="攝影師會在後台看到這段說明" className={field} />
                            </label>
                            <button className={`${btnDanger} w-full justify-center`}>確定下架</button>
                          </form>
                        </details>
                      )}
                      <details>
                        <summary className={`${btnOutline} cursor-pointer list-none`}>駁回檢舉…</summary>
                        <form action={dismissReport} className="mt-2 w-72 space-y-2 rounded-xl border bg-white p-3 shadow-lg">
                          <input type="hidden" name="id" value={id} />
                          <label className="block text-sm font-medium">備註（選填）
                            <textarea name="note" maxLength={200} rows={2} placeholder="例如：已確認是攝影師本人拍攝" className={field} />
                          </label>
                          <button className={`${btnOutline} w-full justify-center`}>確定駁回</button>
                        </form>
                      </details>
                      {w && w.status !== "approved" && <span className={`${btnGhost} cursor-default`}>作品已不公開，可直接駁回結案</span>}
                    </div>
                  ) : (
                    r.note && <p className="text-sm text-gray-600"><span className="font-medium">處理備註：</span>{r.note}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function ReportsPage(props: PageProps<"/review/reports">) {
  return (
    <Suspense>
      <ReportsPageContent {...props} />
    </Suspense>
  );
}
