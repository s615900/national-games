import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportButton } from "@/components/ReportButton";
import { WorkCard, WorkThumb } from "@/components/WorkCard";
import { getWork, listWorks } from "@/lib/data";
import { photoUrl } from "@/lib/photos";
import { getSport } from "@/lib/sports";

async function WorkPageContent({ params }: PageProps<"/works/[id]">) {
  const { id } = await params;
  const work = await getWork(id);
  if (!work) notFound();
  const sport = getSport(work.sport);
  const more = (await listWorks({ photographerId: work.photographerId, limit: 5 })).filter((w) => w.id !== work.id).slice(0, 4);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/works" className="text-sm text-gray-500 hover:underline">← 回作品列表</Link>
      <div className="mt-4"><WorkThumb work={work} tall /></div>
      {work.photos.length > 1 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {work.photos.slice(1).map((p, i) => (
            <li key={p.id}>
              <a href={photoUrl(p.id, "full")} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- 已經處理過的縮圖 */}
                <img src={photoUrl(p.id)} alt={`${work.title} 第 ${i + 2} 張`} loading="lazy" className="aspect-[4/3] w-full rounded-lg bg-gray-100 object-contain transition hover:opacity-90" />
              </a>
            </li>
          ))}
        </ul>
      )}
      <h1 className="mt-6 text-2xl font-bold">{work.title}</h1>
      <p className="mt-1 text-gray-500">{sport?.emoji} {sport?.name}・{work.event}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-gray-500">拍攝日期</dt><dd>{work.date}</dd></div>
        <div><dt className="text-gray-500">地點</dt><dd>{work.location}</dd></div>
        <div><dt className="text-gray-500">攝影師</dt><dd><Link className="underline" href={`/photographers/${work.photographerId}`}>{work.photographerName}</Link></dd></div>
      </dl>
      <p className="mt-6 leading-relaxed">{work.description}</p>
      <ReportButton workId={work.id} />
      {more.length > 0 && (
        <section className="mt-12">
          <h2 className="font-bold">{work.photographerName} 的其他作品</h2>
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
