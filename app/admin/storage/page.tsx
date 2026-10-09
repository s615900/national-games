import { ObjectId } from "mongodb";
import { Suspense } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";
import { PHOTO_LIMITS, siteUsage } from "@/lib/photos";
import { btnDanger, btnOutline, card } from "@/lib/ui";
import { cleanOrphans, findOrphans } from "./actions";

const mb = (b: number) => (b / 1024 / 1024).toFixed(1);

async function StoragePageContent({ searchParams }: PageProps<"/admin/storage">) {
  await requireRole("admin");
  const sp = await searchParams;
  const db = await getDb();
  const [site, orphans, perUser] = await Promise.all([
    siteUsage(),
    findOrphans(),
    db.collection("photos").aggregate<{ _id: string; bytes: number; count: number }>([
      { $group: { _id: "$ownerId", bytes: { $sum: "$bytes" }, count: { $sum: 1 } } },
      { $sort: { bytes: -1 } },
      { $limit: 50 },
    ]).toArray(),
  ]);
  const owners = await db.collection("users").find({ _id: { $in: perUser.filter((u) => ObjectId.isValid(u._id)).map((u) => new ObjectId(u._id)) } }, { projection: { avatar: 0 } }).toArray();
  const ownerOf = new Map(owners.map((o) => [o._id.toString(), o]));

  const pct = Math.min(100, (site.used / PHOTO_LIMITS.siteTotalBytes) * 100);
  const capPct = (PHOTO_LIMITS.siteCapBytes / PHOTO_LIMITS.siteTotalBytes) * 100;
  const level = site.used >= PHOTO_LIMITS.siteCapBytes ? "red" : pct >= 70 ? "amber" : "green";
  const bar = { red: "bg-red-500", amber: "bg-amber-500", green: "bg-green-500" }[level];

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className={`${card} flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between`}>
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">← 回後台</Link>
          <h1 className="mt-1 text-2xl font-bold">照片空間管理</h1>
          <p className="mt-1 text-sm text-gray-500">照片存在資料庫裡，免費版總共只有 {mb(PHOTO_LIMITS.siteTotalBytes)}MB，要隨時注意用量。</p>
        </div>
        <div className="flex gap-2"><Link href="/admin/users" className={btnOutline}>帳號管理</Link><Link href="/review" className={btnOutline}>審核作品</Link></div>
      </header>

      {sp.cleaned && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">已清除 {String(sp.cleaned)} 張孤兒照片。</p>}
      {level === "red" && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><strong>空間已滿，目前暫停收新照片。</strong>請清理資料，或改用外部圖床（例如 Cloudflare R2）。</p>}
      {level === "amber" && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">資料庫已使用超過 70%，建議開始規劃擴充空間。</p>}

      <section className={`${card} p-6`}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-500">資料庫總用量</p>
            <p className="mt-1 text-3xl font-bold">{mb(site.used)}<span className="text-base font-normal text-gray-500"> / {mb(PHOTO_LIMITS.siteTotalBytes)} MB</span></p>
          </div>
          <p className="text-sm text-gray-500">{pct.toFixed(0)}%</p>
        </div>
        <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
          <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
          <div className="absolute top-0 h-full w-0.5 bg-gray-700" style={{ left: `${capPct}%` }} title="超過這條線就暫停收新照片" />
        </div>
        <p className="mt-2 text-xs text-gray-500">黑線（{mb(PHOTO_LIMITS.siteCapBytes)}MB）是「暫停收新照片」的位置，留一些空間給其他資料。</p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["照片張數", site.photoCount, "張"], ["照片佔用", mb(site.photoBytes), "MB"], ["每人上限", mb(PHOTO_LIMITS.perUserBytes), "MB"], ["每件作品上限", PHOTO_LIMITS.perWork, "張"]].map(([label, n, unit]) => (
          <div key={label as string} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{n}<span className="ml-1 text-sm font-normal text-gray-500">{unit}</span></p>
          </div>
        ))}
      </section>

      <section className={card}>
        <div className="border-b px-6 py-4"><h2 className="text-lg font-bold">各攝影師用量</h2></div>
        {perUser.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-gray-500">還沒有人上傳照片</p>
        ) : (
          <ul className="divide-y">
            {perUser.map((u) => {
              const o = ownerOf.get(u._id);
              const name = o?.displayName || o?.name || "（帳號已不存在）";
              const p = Math.min(100, (u.bytes / PHOTO_LIMITS.perUserBytes) * 100);
              return (
                <li key={u._id} className="flex items-center gap-4 px-6 py-4">
                  <Avatar name={name} className="h-10 w-10 text-base" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{name}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className={`h-full ${p >= 90 ? "bg-red-500" : p >= 70 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${p}%` }} /></div>
                  </div>
                  <p className="shrink-0 text-right text-sm text-gray-600">{u.count} 張・{mb(u.bytes)} MB<span className="block text-xs text-gray-400">{p.toFixed(0)}% 的個人上限</span></p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={`${card} p-6`}>
        <h2 className="text-lg font-bold">孤兒照片</h2>
        <p className="mt-1 text-sm text-gray-500">作品已經被刪除、但照片還留著的檔案。正常情況下刪作品時會一起刪，這裡是保險用的清理。</p>
        {orphans.count === 0 ? (
          <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">✓ 沒有孤兒照片，空間都用在有效的作品上。</p>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">發現 <strong>{orphans.count}</strong> 張孤兒照片，共佔 {mb(orphans.bytes)} MB。</p>
            <details className="relative">
              <summary className={`${btnOutline} cursor-pointer list-none text-red-600`}>清除…</summary>
              <div className="absolute left-0 z-10 mt-1 w-60 rounded-xl border bg-white p-4 shadow-lg">
                <p className="text-sm">這些照片的作品都已經不存在，清除後無法復原。</p>
                <form action={cleanOrphans} className="mt-3"><button className={`${btnDanger} w-full justify-center`}>確定清除</button></form>
              </div>
            </details>
          </div>
        )}
      </section>
    </main>
  );
}

export default function StoragePage(props: PageProps<"/admin/storage">) {
  return (
    <Suspense>
      <StoragePageContent {...props} />
    </Suspense>
  );
}
