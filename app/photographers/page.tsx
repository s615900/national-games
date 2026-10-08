import { Suspense } from "react";
import Link from "next/link";
import { listPhotographers } from "@/lib/data";
import { getSport } from "@/lib/sports";

export const metadata = { title: "攝影師｜National Games" };

async function PhotographerList() {
  const photographers = await listPhotographers();
  if (photographers.length === 0) return <p className="mt-12 text-center text-gray-500">還沒有攝影師發表作品</p>;
  return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photographers.map((p) => (
          <Link key={p.id} href={`/photographers/${p.id}`} className="rounded-xl border p-5 transition hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-xl font-bold">{p.name[0]}</div>
            <h2 className="mt-3 font-semibold">{p.name}</h2>
            <p className="text-sm text-gray-500">{p.region}・{p.workCount} 件作品</p>
            <p className="mt-2 line-clamp-2 text-sm">{p.bio}</p>
            <p className="mt-2 text-sm">{p.sports.map((s) => getSport(s)?.emoji).join(" ")}</p>
          </Link>
        ))}
      </div>
  );
}

export default function PhotographersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">攝影師</h1>
      <Suspense><PhotographerList /></Suspense>
    </main>
  );
}
