import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkCard } from "@/components/WorkCard";
import { getPhotographer, listWorks } from "@/lib/data";
import { getSport } from "@/lib/sports";

async function PhotographerPageContent({ params }: PageProps<"/photographers/[id]">) {
  const { id } = await params;
  const p = await getPhotographer(id);
  if (!p) notFound();
  const list = await listWorks({ photographerId: p.id });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/photographers" className="text-sm text-gray-500 hover:underline">← 回攝影師列表</Link>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold">{p.name[0]}</div>
        <div>
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <p className="text-gray-500">{p.region}・{p.sports.map((s) => getSport(s)?.name).join("、")}</p>
          {(p.organization || p.experience) && <p className="text-sm text-gray-500">{[p.organization, p.experience && `攝影年資 ${p.experience}`].filter(Boolean).join("・")}</p>}
          <p className="mt-1 flex flex-wrap gap-x-4 text-sm">
            {p.instagram && <a className="underline" href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noopener noreferrer">Instagram @{p.instagram}</a>}
            {p.facebook && <a className="underline" href={p.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
            {p.website && <a className="underline" href={p.website} target="_blank" rel="noopener noreferrer">個人網站</a>}
          </p>
        </div>
      </div>
      {p.gear && <p className="mt-3 text-sm text-gray-500">常用器材：{p.gear}</p>}
      <p className="mt-4 max-w-2xl">{p.bio}</p>
      <h2 className="mt-10 text-xl font-bold">作品集（{list.length}）</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{list.map((w) => <WorkCard key={w.id} work={w} />)}</div>
    </main>
  );
}

export default function PhotographerPage(props: PageProps<"/photographers/[id]">) {
  return (
    <Suspense>
      <PhotographerPageContent {...props} />
    </Suspense>
  );
}
