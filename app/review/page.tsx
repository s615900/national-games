import { Suspense } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { listWorksForBackend } from "@/lib/data";
import { getSport } from "@/lib/sports";
import { approveWork, rejectWork } from "./actions";

async function ReviewPageContent() {
  await requireRole("reviewer");
  const works = await listWorksForBackend({ status: "pending" });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">← 回後台</Link>
      <h1 className="mt-2 text-2xl font-bold">審核後台</h1>
      <p className="mt-1 text-gray-500">待審核作品：{works.length} 件</p>
      {works.length === 0 && <p className="mt-10 text-center text-gray-500">目前沒有待審核的作品 🎉</p>}
      <ul className="mt-6 space-y-4">
        {works.map((w) => {
          const sport = getSport(w.sport);
          return (
            <li key={w.id} className="rounded-xl border p-4">
              <h2 className="font-semibold">{w.title}</h2>
              <p className="text-sm text-gray-500">{sport?.emoji} {sport?.name}・{w.event || "未填賽事"}・{w.date}・{w.location || "未填地點"}</p>
              <p className="text-sm text-gray-500">攝影師：{w.photographerName}</p>
              {w.description && <p className="mt-2 whitespace-pre-wrap text-sm">{w.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <form action={approveWork}>
                  <input type="hidden" name="id" value={w.id} />
                  <button className="rounded-lg bg-green-600 px-4 py-1.5 text-sm text-white">通過</button>
                </form>
                <form action={rejectWork} className="flex gap-2">
                  <input type="hidden" name="id" value={w.id} />
                  <input name="reason" required maxLength={200} placeholder="退回原因（必填）" className="rounded-lg border px-3 py-1.5 text-sm" />
                  <button className="rounded-lg border border-red-500 px-4 py-1.5 text-sm text-red-600">退回</button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewPageContent />
    </Suspense>
  );
}
