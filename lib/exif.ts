// 照片的拍攝資訊（EXIF）。瀏覽器縮圖時會把 EXIF 洗掉，所以在縮圖前先讀好，隨表單一起送出
export type PhotoExif = { takenAt?: string; camera?: string; lens?: string };

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max) : "");

// 伺服器端重新檢查（不信任瀏覽器送來的 JSON）。依檔案順序一一對應；格式不對的一律當作沒有
export function parsePhotoMeta(fd: FormData, count: number): PhotoExif[] {
  let raw: unknown = [];
  try {
    raw = JSON.parse(String(fd.get("photoMeta") ?? "[]"));
  } catch {
    /* 壞掉的 JSON 當作沒有 */
  }
  const list = Array.isArray(raw) ? raw : [];
  return Array.from({ length: count }, (_, i) => {
    const m = (list[i] ?? {}) as Record<string, unknown>;
    const takenAt = clip(m.takenAt, 16);
    const out: PhotoExif = {};
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(takenAt) && !Number.isNaN(Date.parse(takenAt))) out.takenAt = takenAt;
    if (clip(m.camera, 60)) out.camera = clip(m.camera, 60);
    if (clip(m.lens, 60)) out.lens = clip(m.lens, 60);
    return out;
  });
}
