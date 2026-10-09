import Link from "next/link";
import type { Work } from "@/lib/data";
import { photoUrl } from "@/lib/photos";
import { getSport } from "@/lib/sports";

// 暫時用漸層色塊代替照片；有真實照片後換成圖片
export function WorkThumb({ work, tall = false }: { work: Work; tall?: boolean }) {
  const sport = getSport(work.sport);
  const cover = work.photos[0];
  if (cover) {
    // eslint-disable-next-line @next/next/no-img-element -- 已經處理過的小圖，不需要 Next 再最佳化
    return <img src={photoUrl(cover.id, tall ? "full" : "thumb")} alt={work.title} loading="lazy" className={`${tall ? "aspect-[3/2]" : "aspect-[4/3]"} w-full rounded-xl bg-gray-100 object-cover`} />;
  }
  return (
    <div className={`flex ${tall ? "aspect-[3/2]" : "aspect-[4/3]"} items-center justify-center rounded-xl bg-gradient-to-br ${sport?.color ?? "from-gray-300 to-gray-500"} text-6xl`}>
      {sport?.emoji}
    </div>
  );
}

export function WorkCard({ work }: { work: Work }) {
  return (
    <Link href={`/works/${work.id}`} className="group block">
      <div className="overflow-hidden rounded-xl transition group-hover:scale-[1.02] group-hover:shadow-lg">
        <WorkThumb work={work} />
      </div>
      <h3 className="mt-2 font-semibold">{work.title}</h3>
      <p className="text-sm text-gray-500">{work.photographerName}・{work.event}</p>
    </Link>
  );
}
