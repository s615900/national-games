import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkCard } from "@/components/WorkCard";
import { getPhotographer, getSport, works } from "@/lib/mock-data";

async function PhotographerPageContent({ params }: PageProps<"/photographers/[id]">) {
  const { id } = await params;
  const p = getPhotographer(id);
  if (!p) notFound();
  const list = works.filter((w) => w.photographerId === p.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/photographers" className="text-sm text-gray-500 hover:underline">← 回攝影師列表</Link>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold">{p.name[0]}</div>
        <div>
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <p className="text-gray-500">{p.region}・{p.sports.map((s) => getSport(s)?.name).join("、")}</p>
          {p.instagram && <p className="text-sm">Instagram：@{p.instagram}</p>}
        </div>
      </div>
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
