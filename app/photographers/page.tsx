import Link from "next/link";
import { getSport, photographers, works } from "@/lib/mock-data";

export const metadata = { title: "攝影師｜National Games" };

export default function PhotographersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">攝影師</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photographers.map((p) => (
          <Link key={p.id} href={`/photographers/${p.id}`} className="rounded-xl border p-5 transition hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-xl font-bold">{p.name[0]}</div>
            <h2 className="mt-3 font-semibold">{p.name}</h2>
            <p className="text-sm text-gray-500">{p.region}・{works.filter((w) => w.photographerId === p.id).length} 件作品</p>
            <p className="mt-2 line-clamp-2 text-sm">{p.bio}</p>
            <p className="mt-2 text-sm">{p.sports.map((s) => getSport(s)?.emoji).join(" ")}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
