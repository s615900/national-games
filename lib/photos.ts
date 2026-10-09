import { Binary } from "mongodb";
import sharp from "sharp";
import { getDb } from "@/lib/mongodb";

// ── 照片空間上限（要調整就改這裡）──
// MongoDB Atlas 免費版總共只有 512MB，所以要設上限，不然幾個人就把空間用完
export const PHOTO_LIMITS = {
  perWork: 8, // 每件作品最多幾張
  perUserBytes: 60 * 1024 * 1024, // 每位攝影師最多用多少空間（約 200～300 張）
  maxUploadBytes: 4 * 1024 * 1024, // 單張上傳上限（瀏覽器會先縮小，正常只有幾百 KB）
  siteCapBytes: 430 * 1024 * 1024, // 全站資料量超過這個數字就暫停收新照片（留 80MB 緩衝）
  siteTotalBytes: 512 * 1024 * 1024, // Atlas 免費版總容量，只用來顯示
};

export type ProcessedPhoto = { full: Buffer; thumb: Buffer; width: number; height: number };

// 伺服器自己重新處理圖片：不直接存使用者給的檔案（可能是偽裝成圖片的東西）
export async function processPhoto(file: File): Promise<ProcessedPhoto> {
  if (file.size > PHOTO_LIMITS.maxUploadBytes) throw new Error("有照片太大了，請重新選擇");
  const input = Buffer.from(await file.arrayBuffer());
  try {
    const base = () => sharp(input, { limitInputPixels: 80_000_000 }).rotate();
    const full = await base().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
    const thumb = await base().resize(480, 480, { fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
    return { full: full.data, thumb, width: full.info.width, height: full.info.height };
  } catch {
    throw new Error("有檔案無法讀取，請選 JPG、PNG 或 WebP 圖片");
  }
}

let indexed = false;
async function photos() {
  const col = (await getDb()).collection("photos");
  if (!indexed) {
    await Promise.all([col.createIndex({ workId: 1, order: 1 }), col.createIndex({ ownerId: 1 })]);
    indexed = true;
  }
  return col;
}

export async function userUsage(ownerId: string) {
  const [r] = await (await photos()).aggregate<{ bytes: number; count: number }>([
    { $match: { ownerId } },
    { $group: { _id: null, bytes: { $sum: "$bytes" }, count: { $sum: 1 } } },
  ]).toArray();
  return { bytes: r?.bytes ?? 0, count: r?.count ?? 0 };
}

// 整個資料庫目前用了多少（資料＋索引）。查不到就退回「只算照片」
export async function siteUsage() {
  const db = await getDb();
  const [photoSum] = await db.collection("photos").aggregate<{ bytes: number; count: number }>([{ $group: { _id: null, bytes: { $sum: "$bytes" }, count: { $sum: 1 } } }]).toArray();
  let used = photoSum?.bytes ?? 0;
  try {
    const s = await db.command({ dbStats: 1 });
    used = Math.max(used, (s.dataSize ?? 0) + (s.indexSize ?? 0));
  } catch {
    /* 沒權限就用照片加總 */
  }
  return { used, photoBytes: photoSum?.bytes ?? 0, photoCount: photoSum?.count ?? 0 };
}

// 新增照片前的檢查：張數、個人空間、全站空間。回傳錯誤文字，沒問題回傳 null
export async function checkQuota(ownerId: string, workId: string | null, add: ProcessedPhoto[], removeBytes = 0, removeCount = 0) {
  const addBytes = add.reduce((n, p) => n + p.full.length + p.thumb.length, 0);
  if (workId) {
    const existing = await (await photos()).countDocuments({ workId });
    if (existing - removeCount + add.length > PHOTO_LIMITS.perWork) return `每件作品最多 ${PHOTO_LIMITS.perWork} 張照片`;
  } else if (add.length > PHOTO_LIMITS.perWork) {
    return `每件作品最多 ${PHOTO_LIMITS.perWork} 張照片`;
  }
  if (addBytes === 0) return null;
  const mine = await userUsage(ownerId);
  if (mine.bytes - removeBytes + addBytes > PHOTO_LIMITS.perUserBytes) {
    return `你的照片空間不夠了（上限 ${Math.round(PHOTO_LIMITS.perUserBytes / 1024 / 1024)}MB，已用 ${(mine.bytes / 1024 / 1024).toFixed(1)}MB），請先刪除一些舊照片`;
  }
  const site = await siteUsage();
  if (site.used + addBytes > PHOTO_LIMITS.siteCapBytes) return "網站儲存空間已滿，暫時無法上傳照片，請聯絡管理員";
  return null;
}

export async function savePhotos(workId: string, ownerId: string, list: ProcessedPhoto[]) {
  if (list.length === 0) return;
  const col = await photos();
  const last = await col.find({ workId }).sort({ order: -1 }).limit(1).next();
  let order = (last?.order ?? 0) + 1;
  const now = new Date();
  await col.insertMany(
    list.map((p) => ({ workId, ownerId, full: new Binary(p.full), thumb: new Binary(p.thumb), width: p.width, height: p.height, bytes: p.full.length + p.thumb.length, order: order++, createdAt: now }))
  );
}

export const uploadedFiles = (fd: FormData) => fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);

// 照片網址：縮圖給列表用、大圖給詳細頁
export const photoUrl = (id: string, size: "thumb" | "full" = "thumb") => `/api/photo/${id}?s=${size}`;
