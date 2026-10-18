import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { WorkCard } from "@/components/WorkCard";
import { getPhotographer, getPhotographerStats, listWorks } from "@/lib/data";
import { getSport } from "@/lib/sports";

async function PhotographerPageContent({ params }: PageProps<"/photographers/[id]">) {
  const { id } = await params;
  const p = await getPhotographer(id);
  if (!p) notFound();
  const [list, stats] = await Promise.all([listWorks({ photographerId: p.id }), getPhotographerStats(p.id)]);
  const topSports = stats.sports.slice(0, 5);
  const maxSport = topSports[0]?.count ?? 1;
  const ig = p.instagram?.replace(/^@/, "");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/photographers" className="text-sm text-gray-500 hover:underline">← 回攝影師列表</Link>
      <div className="mt-4 flex items-center gap-4">
        <Avatar name={p.name} src={p.avatarUrl} className="h-20 w-20 text-3xl" />
        <div>
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <p className="text-gray-500">{p.region}・{p.sports.map((s) => getSport(s)?.name).join("、")}</p>
          {(p.organization || p.experience) && <p className="text-sm text-gray-500">{[p.organization, p.experience && `攝影年資 ${p.experience}`].filter(Boolean).join("・")}</p>}
          <p className="mt-1 flex flex-wrap gap-x-4 text-sm">
            {p.instagram && <a className="underline" href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer">Instagram @{ig}</a>}
            {p.facebook && <a className="underline" href={p.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
            {p.website && <a className="underline" href={p.website} target="_blank" rel="noopener noreferrer">個人網站</a>}
          </p>
        </div>
      </div>
      {p.gear && <p className="mt-3 text-sm text-gray-500">常用器材：{p.gear}</p>}
      <p className="mt-4 max-w-2xl">{p.bio}</p>
      <section className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
        {[["作品", stats.works], ["照片", stats.photos], ["獲得讚", stats.likes]].map(([label, n]) => (
          <div key={label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{n}</p>
          </div>
        ))}
      </section>
      {(topSports.length > 0 || stats.gear.length > 0) && (
        <section className="mt-4 grid gap-4 md:grid-cols-2">
          {topSports.length > 0 && (
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="font-bold">擅長運動</h2>
              <ul className="mt-3 space-y-2.5 text-sm">
                {topSports.map((x) => {
                  const sp = getSport(x.sport);
                  return (
                    <li key={x.sport}>
                      <div className="flex justify-between"><span>{sp?.emoji} {sp?.name ?? x.sport}</span><span className="text-gray-500">{x.count} 件</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-100"><div className={`h-full rounded-full bg-gradient-to-r ${sp?.color ?? "from-gray-300 to-gray-500"}`} style={{ width: `${(x.count / maxSport) * 100}%` }} /></div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {stats.gear.length > 0 && (
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="font-bold">器材統計 <span className="text-xs font-normal text-gray-400">依照片內建資料統計</span></h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {stats.gear.map((g) => <li key={g.camera} className="flex justify-between gap-3"><span>📷 {g.camera}</span><span className="shrink-0 text-gray-500">{g.count} 張</span></li>)}
                {stats.lenses.map((g) => <li key={g.lens} className="flex justify-between gap-3"><span>🔭 {g.lens}</span><span className="shrink-0 text-gray-500">{g.count} 張</span></li>)}
              </ul>
            </div>
          )}
        </section>
      )}
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
