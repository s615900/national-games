import Link from "next/link";
import { WorkCard } from "@/components/WorkCard";
import { Suspense } from "react";
import { HeroCarousel, type Slide } from "@/components/HeroCarousel";
import { getStats, listTopViewed } from "@/lib/data";
import { photoUrl } from "@/lib/photos";
import { sports } from "@/lib/sports";

async function Stats() {
  const { works, photographers } = await getStats();
  return <p className="mt-4 text-sm text-gray-500">目前收錄 {works} 件作品、{photographers} 位攝影師、{sports.length} 種運動項目</p>;
}

async function Hero() {
  const top = await listTopViewed(5);
  if (top.length === 0) return null;
  const slides: Slide[] = top.map((w) => ({ id: w.id, title: w.title, photographer: w.photographerName, event: w.event, src: photoUrl(w.photos[0].id, "full") }));
  return <div className="mt-8"><HeroCarousel slides={slides} /></div>;
}

async function FeaturedWorks() {
  const works = await listTopViewed(10);
  if (works.length === 0) {
    return (
      <div className="mt-6 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
        <p className="text-lg font-bold">精選作品即將登場</p>
        <p className="mt-1 text-sm text-gray-500">點擊次數最多的作品會展示在這裡。是攝影師嗎？歡迎投稿。</p>
        <Link href="/register" className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">
          註冊投稿
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
      {works.map((w) => <WorkCard key={w.id} work={w} />)}
    </div>
  );
}

const steps = [
  { n: "01", title: "用 Google 註冊", text: "一鍵登入，填寫基本資料與擅長的運動，送出申請。" },
  { n: "02", title: "等待審核通過", text: "站方確認身分後，你就能進入攝影師後台。" },
  { n: "03", title: "上傳你的作品", text: "上傳照片、標註賽事與運動項目，審核後公開展示。" },
];

export default function Home() {
  return (
    <main>
      {/* 主視覺 */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <h1 className="text-3xl font-bold sm:text-5xl">全台運動攝影師作品平台</h1>
        <p className="mt-3 max-w-xl text-gray-600">從田徑到棒球，從校園到全國賽事，看攝影師鏡頭下的比賽瞬間。</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/works" className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800">瀏覽作品集</Link>
          <Link href="/register" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50">攝影師投稿</Link>
        </div>
        <Suspense><Hero /></Suspense>
        <Suspense><Stats /></Suspense>
      </section>

      {/* 運動項目 */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="text-xl font-bold">依運動項目瀏覽</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {sports.map((s) => (
            <Link key={s.slug} href={`/works?sport=${s.slug}`} className="rounded-full border border-gray-300 px-4 py-2 text-sm transition hover:border-black hover:bg-gray-50">
              {s.name}
            </Link>
          ))}
        </div>
      </section>

      {/* 精選作品 */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">精選作品</h2>
          </div>
          <Link href="/works" className="rounded-full border px-4 py-1.5 text-sm font-medium transition hover:bg-gray-50">看全部 →</Link>
        </div>
        <Suspense><FeaturedWorks /></Suspense>
      </section>

      {/* 投稿流程 */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="text-xl font-bold">成為投稿攝影師</h2>
        <ol className="mt-4 grid gap-6 border-t pt-6 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n}>
              <p className="text-sm text-gray-400">{s.n}</p>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gray-100 px-6 py-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">你的鏡頭，值得被更多人看見</h2>
            <p className="mt-1 text-sm text-gray-600">加入 National Games，讓每一場比賽的精彩瞬間被好好記錄。</p>
          </div>
          <Link href="/register" className="shrink-0 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800">免費註冊投稿</Link>
        </div>
      </section>
    </main>
  );
}
