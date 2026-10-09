import Link from "next/link";
import { WorkCard } from "@/components/WorkCard";
import { Suspense } from "react";
import { getStats, listWorks } from "@/lib/data";
import { sports } from "@/lib/sports";

async function Stats() {
  const { works, photographers } = await getStats();
  return <p className="mt-8 text-sm text-gray-400">{works} 件作品・{photographers} 位攝影師・{sports.length} 種運動</p>;
}

async function FeaturedWorks() {
  const works = await listWorks({ limit: 8 });
  if (works.length === 0) return <p className="mt-6 text-gray-500">還沒有作品，敬請期待。</p>;
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {works.map((w) => <WorkCard key={w.id} work={w} />)}
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <section className="bg-gradient-to-br from-gray-900 to-gray-700 px-4 py-20 text-center text-white">
        <h1 className="text-4xl font-bold sm:text-5xl">捕捉每一個運動瞬間</h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-300">集結全台灣運動攝影師的作品，從田徑到棒球，從校園到全國賽事。</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/works" className="rounded-lg bg-white px-6 py-3 font-semibold text-black">瀏覽作品</Link>
          <Link href="/register" className="rounded-lg border border-white px-6 py-3">我是攝影師，我要註冊投稿</Link>
        </div>
        <Suspense><Stats /></Suspense>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <h2 className="text-xl font-bold">依運動項目瀏覽</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sports.map((s) => (
            <Link key={s.slug} href={`/works?sport=${s.slug}`} className={`flex items-center gap-3 rounded-xl bg-gradient-to-br ${s.color} p-4 text-white transition hover:scale-[1.03]`}>
              <span className="text-3xl">{s.emoji}</span>
              <span className="font-semibold">{s.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">精選作品</h2>
          <Link href="/works" className="text-sm underline">看全部</Link>
        </div>
        <Suspense><FeaturedWorks /></Suspense>
      </section>
    </main>
  );
}
