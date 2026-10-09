import { removeAvatar } from "@/app/dashboard/actions";
import { AvatarCropper } from "@/components/AvatarCropper";

// 沒有大頭貼就顯示名字的第一個字
export function Avatar({ name, src, className = "h-14 w-14 text-xl" }: { name: string; src?: string; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- 已經是 256px 的小圖，不需要 Next 再處理
    return <img src={src} alt={name} className={`${className} shrink-0 rounded-full bg-gray-100 object-cover`} />;
  }
  return <div className={`${className} flex shrink-0 items-center justify-center rounded-full bg-black font-bold text-white`}>{name.slice(0, 1) || "?"}</div>;
}

// 大頭貼上傳區（跟個人資料表單是分開的兩個表單）
export function AvatarEditor({ name, src, from }: { name: string; src?: string; from: "/pending" | "/dashboard/profile" }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center">
      <Avatar name={name} src={src} className="h-24 w-24 text-3xl" />
      <div className="flex-1">
        <h2 className="font-bold">大頭貼</h2>
        <p className="mt-1 text-sm text-gray-500">JPG、PNG 或 WebP。選好圖片後可以自己拖曳調整位置和大小。</p>
        <AvatarCropper from={from} hasAvatar={!!src} />
        {src && (
          <form action={removeAvatar} className="mt-2">
            <input type="hidden" name="from" value={from} />
            <button className="text-sm text-gray-500 underline hover:text-red-600">移除大頭貼</button>
          </form>
        )}
      </div>
    </section>
  );
}
