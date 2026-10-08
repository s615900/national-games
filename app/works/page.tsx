import { Suspense } from "react";
import Link from "next/link";
import { WorkCard } from "@/components/WorkCard";
import { listWorks } from "@/lib/data";
import { sports } from "@/lib/sports";

export const metadata = { title: "作品瀏覽｜National Games" };

async function WorksPageContent({ searchParams }: PageProps<"/works">) {
  const sp = await searchParams;
  const sport = typeof sp.sport === "string" ? sp.sport : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const list = await listWorks({ sport, q });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">作品瀏覽</h1>
      <form className="mt-4 flex gap-2">
        {sport && <input type="hidden" name="sport" value={sport} />}
        <input name="q" defaultValue={q} placeholder="搜尋標題、賽事、地點" className="w-full max-w-sm rounded-lg border px-3 py-2" />
        <button className="rounded-lg bg-black px-4 text-white">搜尋</button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/works" className={`rounded-full border px-3 py-1 ${!sport ? "bg-black text-white" : ""}`}>全部</Link>
        {sports.map((s) => (
          <Link key={s.slug} href={`/works?sport=${s.slug}`} className={`rounded-full border px-3 py-1 ${sport === s.slug ? "bg-black text-white" : ""}`}>
            {s.emoji} {s.name}
          </Link>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">找不到符合條件的作品</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((w) => <WorkCard key={w.id} work={w} />)}
        </div>
      )}
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
