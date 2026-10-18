import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireRole } from "@/lib/guard";
import { purposeLabel } from "@/lib/inquiries";
import { getDb } from "@/lib/mongodb";
import { btnGhost, btnOutline } from "@/lib/ui";
import { deleteInquiry, setInquiryRead } from "./actions";

async function InquiriesContent() {
  await connection();
  const session = await requireRole("photographer");
  const list = await (await getDb()).collection("inquiries").find({ photographerId: session.user.id }).sort({ createdAt: -1 }).limit(200).toArray();
  const unread = list.filter((i) => !i.read).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">← 回後台</Link>
      <h1 className="mt-2 text-2xl font-bold">原圖洽詢{unread > 0 && <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 align-middle text-xs font-medium text-white">{unread} 則未讀</span>}</h1>
      <p className="mt-1 text-sm text-gray-500">選手、家長想要你作品的原圖時，留言會出現在這裡。請直接用對方留的方式聯絡，是否提供、是否收費由你決定。</p>

      {list.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
          <p className="text-4xl">📩</p>
          <p className="mt-3 font-medium">還沒有人洽詢</p>
          <p className="mt-1 text-sm text-gray-500">作品公開後，作品頁會有「洽詢原圖」按鈕。</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((i) => (
            <li key={i._id.toString()} className={`rounded-2xl border bg-white p-5 shadow-sm ${i.read ? "" : "border-amber-300 ring-1 ring-amber-200"}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold">{i.name}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{purposeLabel(i.purpose)}</span>
                {!i.read && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">未讀</span>}
                <span className="ml-auto text-xs text-gray-400">{new Date(i.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">作品：<Link href={`/works/${i.workId}`} className="underline">{i.workTitle || "（未命名）"}</Link></p>
              <p className="mt-3 whitespace-pre-wrap text-sm">{i.message}</p>
              <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm"><span className="text-gray-500">聯絡方式：</span><span className="select-all font-medium">{i.contact}</span></p>
              <div className="mt-3 flex gap-2">
                <form action={setInquiryRead}>
                  <input type="hidden" name="id" value={i._id.toString()} />
                  <input type="hidden" name="read" value={i.read ? "0" : "1"} />
                  <button className={btnOutline}>{i.read ? "標為未讀" : "✓ 標為已處理"}</button>
                </form>
                <form action={deleteInquiry}>
                  <input type="hidden" name="id" value={i._id.toString()} />
                  <button className={`${btnGhost} text-red-600 hover:bg-red-50`}>刪除</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function InquiriesPage() {
  return (
    <Suspense>
      <InquiriesContent />
    </Suspense>
  );
}
