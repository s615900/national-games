import { saveAvatar, removeAvatar } from "@/app/dashboard/actions";

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
        <p className="mt-1 text-sm text-gray-500">JPG、PNG 或 WebP，5MB 以內。系統會自動裁成正方形，建議人像置中。</p>
        <form action={saveAvatar} className="mt-3 flex flex-wrap items-center gap-2">
          <input type="hidden" name="from" value={from} />
          <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" required className="max-w-full text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-50" />
          <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">{src ? "更換大頭貼" : "上傳大頭貼"}</button>
        </form>
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
