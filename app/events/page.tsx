import { Suspense } from "react";
import Link from "next/link";
import { listWorks } from "@/lib/data";
import { photoUrl } from "@/lib/photos";
import { EVENT_BOARD_URL, listBoardEvents } from "@/lib/event-board";

export const metadata = { title: "賽事列表｜National Games" };

async function EventsContent() {
  const [works, board] = await Promise.all([listWorks(), listBoardEvents()]);
  // 日期是 YYYY-MM-DD，可直接用字串和今天比；已結束的收起來，只列還沒結束的
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
  const upcoming = board.filter((e) => e.endDate >= today).slice(0, 12);
  // 依「賽事名稱」把審核通過的作品分組，沒填賽事名稱的不列入
  const groups = new Map<string, typeof works>();
  for (const w of works) {
    const name = w.event.trim();
    if (name) groups.set(name, [...(groups.get(name) ?? []), w]);
  }
  const events = [...groups.entries()];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold tracking-widest text-orange-500">EVENTS</p>
      <h1 className="mt-1 text-4xl font-extrabold">賽事列表</h1>
      <p className="mt-3 text-gray-600">近期賽事日期，以及依比賽整理的攝影師作品。</p>
      <a href={EVENT_BOARD_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">前往賽事看板 →</a>

      <h2 className="mt-10 text-xl font-bold">📅 近期賽事日期</h2>
      {upcoming.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">目前沒有可顯示的賽事日期，到賽事看板看看完整列表。</p>
      ) : (
        <ul className="mt-4 divide-y rounded-2xl border">
          {upcoming.map((e) => (
            <li key={e.id}>
              <a href={e.url} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1 px-4 py-3 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4">
                <span className="w-56 shrink-0 font-mono text-sm text-orange-600">
                  {e.startDate === e.endDate ? e.startDate : `${e.startDate} ~ ${e.endDate.slice(5)}`}
                </span>
                <span className="font-semibold">{e.name}</span>
                <span className="text-sm text-gray-500 sm:ml-auto">{[e.sportName, e.county].filter(Boolean).join("・")}</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-12 text-xl font-bold">📷 賽事作品</h2>

      {events.length === 0 ? (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-20 text-center">
          <div className="text-5xl">🏟️</div>
          <p className="mt-4 text-lg font-bold">還沒有賽事</p>
          <p className="mt-1 text-sm text-gray-500">作品上架後，會依賽事名稱自動整理在這裡。</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(([name, list]) => {
            const cover = list.find((w) => w.photos[0])?.photos[0];
            return (
              <Link key={name} href={`/works?q=${encodeURIComponent(name)}`} className="group overflow-hidden rounded-2xl border transition hover:shadow-lg">
                {cover ? (
                  <img src={photoUrl(cover.id, "thumb")} alt={name} loading="lazy" className="aspect-[16/9] w-full bg-gray-100 object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="aspect-[16/9] w-full bg-gray-100" />
                )}
                <div className="p-4">
                  <p className="font-bold">{name}</p>
                  <p className="mt-1 text-sm text-gray-500">{list.length} 件作品</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense>
      <EventsContent />
    </Suspense>
  );
}
