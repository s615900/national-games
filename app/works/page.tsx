import { Suspense } from "react";
import Link from "next/link";
import { WorkCard } from "@/components/WorkCard";
import { listWorks } from "@/lib/data";
import { getSport, sports } from "@/lib/sports";

export const metadata = { title: "作品集｜National Games" };

async function WorksPageContent({ searchParams }: PageProps<"/works">) {
  const sp = await searchParams;
  const sport = typeof sp.sport === "string" ? sp.sport : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const list = await listWorks({ sport, q });
  const current = getSport(sport);
  const filtered = Boolean(sport || q);

  return (
    <main>
      <section className="relative overflow-hidden bg-gray-950 px-4 pb-10 pt-12 text-white">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-sm font-semibold tracking-widest text-orange-400">PORTFOLIO</p>
          <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">
            {current ? <>{current.emoji} {current.name}作品集</> : "作品集"}
          </h1>
          <p className="mt-3 text-gray-300">全台攝影師鏡頭下的精彩瞬間，依運動項目或關鍵字慢慢逛。</p>

          <form className="mt-6 flex max-w-xl gap-2">
            {sport && <input type="hidden" name="sport" value={sport} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="🔍 搜尋標題、賽事、地點"
              className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-white placeholder:text-gray-400 outline-none backdrop-blur transition focus:border-white/60 focus:bg-white/15"
            />
            <button className="shrink-0 rounded-full bg-white px-6 font-bold text-black transition hover:scale-105">搜尋</button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 text-sm sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <Link href="/works" className={`shrink-0 rounded-full border px-4 py-1.5 font-medium transition ${!sport ? "border-black bg-black text-white" : "hover:bg-gray-50"}`}>全部</Link>
          {sports.map((s) => (
            <Link
              key={s.slug}
              href={`/works?sport=${s.slug}`}
              className={`shrink-0 rounded-full border px-4 py-1.5 font-medium transition ${sport === s.slug ? `border-transparent bg-gradient-to-br ${s.color} text-white shadow` : "hover:bg-gray-50"}`}
            >
              {s.emoji} {s.name}
            </Link>
          ))}
        </div>

        <p className="mt-4 text-sm text-gray-500">
          {filtered ? `找到 ${list.length} 件作品` : `共 ${list.length} 件作品`}
          {q && <>，關鍵字「{q}」</>}
        </p>

        {list.length === 0 ? (
          <div className="mt-6 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-20 text-center">
            <div className="text-5xl">{current?.emoji ?? "📷"}</div>
            <p className="mt-4 text-lg font-bold">{filtered ? "找不到符合條件的作品" : "作品集還是空的"}</p>
            <p className="mt-1 text-sm text-gray-500">{filtered ? "換個關鍵字或運動項目試試看。" : "第一批作品即將登場，敬請期待。"}</p>
            {filtered ? (
              <Link href="/works" className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">清除篩選</Link>
            ) : (
              <Link href="/register" className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">我是攝影師，我要投稿</Link>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((w) => <WorkCard key={w.id} work={w} />)}
          </div>
        )}
      </div>
    </main>
  );
}

export default function WorksPage(props: PageProps<"/works">) {
  return (
    <Suspense>
      <WorksPageContent {...props} />
    </Suspense>
  );
}
