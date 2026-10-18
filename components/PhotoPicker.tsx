"use client";
import { useRef, useState } from "react";
import type { PhotoExif } from "@/lib/exif";

const MAX_EDGE = 1600;
const MAX_TOTAL = 5 * 1024 * 1024; // 一次送出的總大小（伺服器 Server Action 上限 6MB）

type Item = { id: string; url: string; name: string; size: number; exif: PhotoExif };

export const PHOTO_EXIF_EVENT = "photo-exif"; // 通知 ExifAssist：目前選的照片有哪些拍攝資訊

const pad = (n: number) => String(n).padStart(2, "0");
const clean = (s: unknown) => (typeof s === "string" ? s.trim() : "");

// 縮圖會把 EXIF 洗掉，所以要在縮圖「之前」從原檔讀拍攝時間與器材；讀不到（沒有 EXIF）就當作沒有
async function readExif(file: File): Promise<PhotoExif> {
  try {
    const exifr = (await import("exifr")).default;
    const t = await exifr.parse(file, ["DateTimeOriginal", "Make", "Model", "LensModel"]);
    if (!t) return {};
    const out: PhotoExif = {};
    const d = t.DateTimeOriginal;
    if (d instanceof Date && !Number.isNaN(d.getTime())) out.takenAt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const make = clean(t.Make), model = clean(t.Model);
    // 很多機身的 Model 已經包含廠牌（例如 "Canon EOS R5"），不要重複
    const camera = model.toLowerCase().startsWith(make.split(" ")[0].toLowerCase()) ? model : `${make} ${model}`.trim();
    if (camera) out.camera = camera.slice(0, 60);
    if (clean(t.LensModel)) out.lens = clean(t.LensModel).slice(0, 60);
    return out;
  } catch {
    return {};
  }
}

// 在瀏覽器裡先把照片縮小（長邊 1600px、webp），上傳更快，也不會超過伺服器的大小限制
async function shrink(file: File): Promise<File> {
  const bmp = await createImageBitmap(file); // 會自動依 EXIF 轉正
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  if (!blob) throw new Error("轉檔失敗");
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
}

export function PhotoPicker({ max }: { max: number }) {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const files = useRef(new Map<string, File>());
  const real = useRef<HTMLInputElement>(null); // 真正跟著表單送出的欄位（name="photos"）

  function sync(list: Item[]) {
    window.dispatchEvent(new CustomEvent<PhotoExif[]>(PHOTO_EXIF_EVENT, { detail: list.map((i) => i.exif) }));
    const dt = new DataTransfer();
    for (const i of list) dt.items.add(files.current.get(i.id)!);
    if (real.current) real.current.files = dt.files;
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = [...(e.target.files ?? [])];
    e.target.value = "";
    if (picked.length === 0) return;
    setError(""); setBusy(true);
    let list = [...items];
    try {
      for (const f of picked) {
        if (list.length >= max) { setError(`最多再加 ${max} 張`); break; }
        if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { setError("只能選 JPG、PNG 或 WebP 圖片"); continue; }
        const exif = await readExif(f);
        const small = await shrink(f);
        const total = list.reduce((n, i) => n + i.size, 0) + small.size;
        if (total > MAX_TOTAL) { setError("這次選的照片總量太大，請分次儲存或減少張數"); break; }
        const id = crypto.randomUUID();
        files.current.set(id, small);
        list = [...list, { id, url: URL.createObjectURL(small), name: f.name, size: small.size, exif }];
      }
    } catch {
      setError("有照片無法處理，請換一張試試");
    }
    setItems(list); sync(list); setBusy(false);
  }

  function remove(id: string) {
    const item = items.find((i) => i.id === id);
    if (item) URL.revokeObjectURL(item.url);
    files.current.delete(id);
    const list = items.filter((i) => i.id !== id);
    setItems(list); sync(list);
  }

  const full = items.length >= max;
  return (
    <div>
      <input ref={real} type="file" name="photos" multiple className="hidden" tabIndex={-1} aria-hidden />
      <input type="hidden" name="photoMeta" value={JSON.stringify(items.map((i) => i.exif))} />
      {items.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((i) => (
            <li key={i.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- 本機預覽用的暫時網址 */}
              <img src={i.url} alt={i.name} className="h-full w-full object-cover" />
              <button type="button" onClick={() => remove(i.id)} aria-label={`移除 ${i.name}`} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-sm text-white hover:bg-black">×</button>
            </li>
          ))}
        </ul>
      )}
      <label className={`flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm transition ${full ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400" : "border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400 hover:bg-gray-100"}`}>
        <span className="text-2xl">🖼️</span>
        <span className="mt-1 font-medium">{busy ? "照片處理中…" : full ? "已達張數上限" : "點這裡選擇照片（可一次選多張）"}</span>
        <span className="mt-0.5 text-xs">JPG、PNG、WebP・還能再加 {Math.max(0, max - items.length)} 張・會自動縮小，不用先處理</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={full || busy} onChange={onPick} className="sr-only" />
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
