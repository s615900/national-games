import Link from "next/link";
import type { Work } from "@/lib/data";
import { photoUrl } from "@/lib/photos";
import { getSport } from "@/lib/sports";

// 暫時用漸層色塊代替照片；有真實照片後換成圖片
export function WorkThumb({ work, tall = false }: { work: Work; tall?: boolean }) {
  const sport = getSport(work.sport);
  const cover = work.photos[0];
  if (cover) {
    if (tall) {
      // 詳細頁：照片依原始比例完整顯示（不裁切），太高的直式照片限制高度並置中
      const ratio = cover.width && cover.height ? `${cover.width} / ${cover.height}` : undefined;
      return (
        <div className="flex justify-center rounded-xl bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element -- 已經處理過的小圖，不需要 Next 再最佳化 */}
          <img src={photoUrl(cover.id, "full")} alt={work.title} width={cover.width || undefined} height={cover.height || undefined} style={{ aspectRatio: ratio }} className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain" />
        </div>
      );
    }
    // eslint-disable-next-line @next/next/no-img-element -- 已經處理過的小圖，不需要 Next 再最佳化
    return <img src={photoUrl(cover.id, "thumb")} alt={work.title} loading="lazy" className="aspect-[4/3] w-full rounded-xl bg-gray-100 object-cover" />;
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
