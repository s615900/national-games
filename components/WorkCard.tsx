import Link from "next/link";
import { getPhotographer, getSport, type Work } from "@/lib/mock-data";

// 暫時用漸層色塊代替照片；有真實照片後換成圖片
export function WorkThumb({ work, tall = false }: { work: Work; tall?: boolean }) {
  const sport = getSport(work.sport);
  return (
    <div className={`flex ${tall ? "aspect-[3/2]" : "aspect-[4/3]"} items-center justify-center rounded-xl bg-gradient-to-br ${sport?.color ?? "from-gray-300 to-gray-500"} text-6xl`}>
      {sport?.emoji}
    </div>
  );
}

export function WorkCard({ work }: { work: Work }) {
  const p = getPhotographer(work.photographerId);
  return (
    <Link href={`/works/${work.id}`} className="group block">
      <div className="overflow-hidden rounded-xl transition group-hover:scale-[1.02] group-hover:shadow-lg">
        <WorkThumb work={work} />
      </div>
      <h3 className="mt-2 font-semibold">{work.title}</h3>
      <p className="text-sm text-gray-500">{p?.name}・{work.event}</p>
    </Link>
  );
}
