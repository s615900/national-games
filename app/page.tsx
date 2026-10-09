import Link from "next/link";
import { WorkCard } from "@/components/WorkCard";
import { Suspense } from "react";
import { getStats, listWorks } from "@/lib/data";
import { sports } from "@/lib/sports";

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
      <div className="text-3xl font-extrabold tabular-nums">{value}</div>
      <div className="mt-1 text-xs tracking-widest text-gray-400">{label}</div>
    </div>
  );
}

async function Stats() {
  const { works, photographers } = await getStats();
  return (
    <div className="mx-auto mt-14 grid max-w-xl grid-cols-3 gap-3">
      <StatBox value={works} label="件作品" />
      <StatBox value={photographers} label="位攝影師" />
      <StatBox value={sports.length} label="種運動" />
    </div>
  );
}

async function FeaturedWorks() {
  const works = await listWorks({ limit: 8 });
  if (works.length === 0) {
    return (
      <div className="mt-6 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
        <div className="text-5xl">📷</div>
        <p className="mt-4 text-lg font-bold">第一批作品即將登場</p>
        <p className="mt-1 text-sm text-gray-500">是攝影師嗎？成為第一位投稿的人，作品會出現在這裡。</p>
        <Link href="/register" className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">
          註冊投稿
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {works.map((w) => <WorkCard key={w.id} work={w} />)}
    </div>
  );
}

const steps = [
  { n: "01", icon: "🔑", title: "用 Google 註冊", text: "一鍵登入，填寫基本資料與擅長的運動，送出申請。" },
  { n: "02", icon: "✅", title: "等待審核通過", text: "站方確認身分後，你就能進入攝影師後台。" },
  { n: "03", icon: "🖼️", title: "上傳你的作品", text: "上傳照片、標註賽事與運動項目，審核後公開展示。" },
];

export default function Home() {
  return (
    <main>
      {/* 主視覺 */}
      <section className="relative overflow-hidden bg-gray-950 px-4 pb-20 pt-24 text-center text-white">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="relative">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs tracking-widest text-gray-200">
            📸 全台運動攝影師作品平台
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-tight sm:text-7xl">
            捕捉每一個
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 bg-clip-text text-transparent">運動瞬間</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-300">
            集結全台灣運動攝影師的作品，從田徑到棒球，從校園到全國賽事。
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/works" className="rounded-full bg-white px-8 py-3.5 font-bold text-black shadow-lg shadow-white/10 transition hover:scale-105">
              瀏覽作品集 →
            </Link>
            <Link href="/register" className="rounded-full border border-white/40 px-8 py-3.5 font-semibold transition hover:bg-white/10">
              我是攝影師，我要投稿
            </Link>
          </div>
          <Suspense><Stats /></Suspense>
        </div>
      </section>

      {/* 運動項目 */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <p className="text-sm font-semibold tracking-widest text-orange-500">CATEGORIES</p>
        <h2 className="mt-1 text-3xl font-extrabold">依運動項目瀏覽</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {sports.map((s) => (
            <Link
              key={s.slug}
              href={`/works?sport=${s.slug}`}
              className={`group relative flex h-36 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${s.color} p-4 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl`}
            >
              <span className="absolute -right-3 -top-3 text-8xl opacity-30 transition group-hover:scale-110 group-hover:opacity-50">{s.emoji}</span>
              <span className="relative text-2xl">{s.emoji}</span>
              <span className="relative mt-1 text-lg font-bold">{s.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 精選作品 */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-sky-500">FEATURED</p>
            <h2 className="mt-1 text-3xl font-extrabold">精選作品</h2>
          </div>
          <Link href="/works" className="rounded-full border px-4 py-1.5 text-sm font-medium transition hover:bg-gray-50">看全部 →</Link>
        </div>
        <Suspense><FeaturedWorks /></Suspense>
      </section>

      {/* 投稿流程 */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <p className="text-sm font-semibold tracking-widest text-violet-500">HOW IT WORKS</p>
        <h2 className="mt-1 text-3xl font-extrabold">三步驟，成為投稿攝影師</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative overflow-hidden rounded-2xl border bg-white p-6 transition hover:shadow-lg">
              <span className="absolute right-4 top-2 text-6xl font-black text-gray-100">{s.n}</span>
              <div className="relative text-3xl">{s.icon}</div>
              <h3 className="relative mt-3 text-lg font-bold">{s.title}</h3>
              <p className="relative mt-1 text-sm leading-relaxed text-gray-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 行動呼籲 */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 px-6 py-14 text-center text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-orange-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-sky-500/30 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold">你的鏡頭，值得被更多人看見</h2>
          <p className="relative mx-auto mt-3 max-w-md text-gray-300">加入 National Games，讓每一場比賽的精彩瞬間被好好記錄。</p>
          <Link href="/register" className="relative mt-8 inline-block rounded-full bg-white px-8 py-3.5 font-bold text-black transition hover:scale-105">
            免費註冊投稿
          </Link>
        </div>
      </section>
    </main>
  );
}
