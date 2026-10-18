import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { WorkCard } from "@/components/WorkCard";
import { listWorks, listPhotographers } from "@/lib/data";
import { listBoardEvents } from "@/lib/event-board";
import { sports } from "@/lib/sports";

export async function generateMetadata({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const e = (await listBoardEvents()).find((x) => x.id === id);
  return { title: e ? `${e.name}｜National Games` : "賽事｜National Games" };
}

// 賽事看板每建立一場賽事，這裡就自動有一個作品頁（不用另外建立）
async function EventPageContent({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const event = (await listBoardEvents()).find((e) => e.id === id);
  if (!event) notFound();
  const [works, allPhotographers] = await Promise.all([listWorks({ event: { id: event.id, name: event.name } }), listPhotographers()]);

  // 參與的攝影師：有作品在這場賽事的人，作品多的排前面
  const counts = new Map<string, number>();
  for (const w of works) counts.set(w.photographerId, (counts.get(w.photographerId) ?? 0) + 1);
  const photographers = allPhotographers.filter((p) => counts.has(p.id)).sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));

  const sport = sports.find((s) => event.sportName.includes(s.name));
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
  const status = event.endDate < today ? "已結束" : event.startDate > today ? "即將舉行" : "進行中";
  const dates = event.startDate === event.endDate ? event.startDate : `${event.startDate} ~ ${event.endDate}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/events" className="text-sm text-gray-500 hover:underline">← 回賽事列表</Link>
      <p className="mt-4 text-sm font-semibold tracking-widest text-orange-500">{sport?.emoji} {event.sportName}</p>
      <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{event.name}</h1>
      <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border bg-white p-5 text-sm shadow-sm sm:grid-cols-4">
        <div><dt className="text-gray-500">日期</dt><dd className="mt-0.5 font-medium">{dates}</dd></div>
        <div><dt className="text-gray-500">地點</dt><dd className="mt-0.5 font-medium">{[event.county, event.location].filter(Boolean).join(" ") || "—"}</dd></div>
        <div><dt className="text-gray-500">項目</dt><dd className="mt-0.5 font-medium">{event.sportName || "—"}</dd></div>
        <div><dt className="text-gray-500">狀態</dt><dd className="mt-0.5 font-medium">{status}</dd></div>
      </dl>
      <p className="mt-3 flex flex-wrap gap-x-5 text-sm">
        <a className="underline" href={event.url} target="_blank" rel="noopener noreferrer">在賽事看板查看完整資訊 ↗</a>
        {event.officialUrl && <a className="underline" href={event.officialUrl} target="_blank" rel="noopener noreferrer">官方公告 ↗</a>}
      </p>

      {photographers.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">參與攝影師（{photographers.length}）</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {photographers.map((p) => (
              <li key={p.id}>
                <Link href={`/photographers/${p.id}`} className="flex items-center gap-2.5 rounded-full border bg-white py-1.5 pl-1.5 pr-4 text-sm transition hover:shadow-md">
                  <Avatar name={p.name} src={p.avatarUrl} className="h-9 w-9 text-sm" />
                  <span className="font-medium">{p.name}</span>
                  <span className="text-gray-400">{counts.get(p.id)} 件</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-10 text-xl font-bold">賽事作品（{works.length}）</h2>
      {works.length === 0 ? (
        <div className="mt-4 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
          <div className="text-5xl">📷</div>
          <p className="mt-4 text-lg font-bold">還沒有人上傳這場比賽的作品</p>
          <p className="mt-1 text-sm text-gray-500">你是這場比賽的攝影師嗎？投稿時選這場賽事，作品通過審核後就會出現在這裡。</p>
          <Link href="/dashboard/works/new" className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">上傳作品</Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">{works.map((w) => <WorkCard key={w.id} work={w} />)}</div>
      )}
    </main>
  );
}

export default function EventPage(props: PageProps<"/events/[id]">) {
  return (
    <Suspense>
      <EventPageContent {...props} />
    </Suspense>
  );
}
