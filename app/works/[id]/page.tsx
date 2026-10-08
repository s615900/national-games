import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkCard, WorkThumb } from "@/components/WorkCard";
import { getPhotographer, getSport, getWork, works } from "@/lib/mock-data";

async function WorkPageContent({ params }: PageProps<"/works/[id]">) {
  const { id } = await params;
  const work = getWork(id);
  if (!work) notFound();
  const p = getPhotographer(work.photographerId);
  const sport = getSport(work.sport);
  const more = works.filter((w) => w.photographerId === work.photographerId && w.id !== work.id).slice(0, 4);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/works" className="text-sm text-gray-500 hover:underline">← 回作品列表</Link>
      <div className="mt-4"><WorkThumb work={work} tall /></div>
      <h1 className="mt-6 text-2xl font-bold">{work.title}</h1>
      <p className="mt-1 text-gray-500">{sport?.emoji} {sport?.name}・{work.event}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-gray-500">拍攝日期</dt><dd>{work.date}</dd></div>
        <div><dt className="text-gray-500">地點</dt><dd>{work.location}</dd></div>
        <div><dt className="text-gray-500">攝影師</dt><dd><Link className="underline" href={`/photographers/${p?.id}`}>{p?.name}</Link></dd></div>
      </dl>
      <p className="mt-6 leading-relaxed">{work.description}</p>
      <button disabled className="mt-6 rounded-lg border px-4 py-2 text-sm text-gray-400" title="之後開放">檢舉此作品（尚未開放）</button>
      {more.length > 0 && (
        <section className="mt-12">
          <h2 className="font-bold">{p?.name} 的其他作品</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">{more.map((w) => <WorkCard key={w.id} work={w} />)}</div>
        </section>
      )}
    </main>
  );
}

export default function WorkPage(props: PageProps<"/works/[id]">) {
  return (
    <Suspense>
      <WorkPageContent {...props} />
    </Suspense>
  );
}
