import { connection } from "next/server";
import { ObjectId, type Document } from "mongodb";
import { getDb as getMongoDb } from "@/lib/mongodb";

// 資料庫的內容隨時會變，要等有人瀏覽時才讀取，不能在建置階段預先產生
async function getDb() {
  await connection();
  return getMongoDb();
}

export type Photographer = { id: string; name: string; region: string; bio: string; sports: string[]; instagram?: string; facebook?: string; website?: string; organization?: string; experience?: string; gear?: string; avatarUrl?: string };
// 完整資料（含不公開欄位）：只能給本人和管理員看
export type FullProfile = Photographer & { realName: string; phone: string; email: string; agreedAt?: Date };
export type Work = { id: string; title: string; photographerId: string; photographerName: string; sport: string; event: string; date: string; location: string; description: string; status: string; rejectReason?: string; resubmitted?: boolean; featured?: boolean; eventId?: string; likes: number; photos: { id: string; width: number; height: number; takenAt?: string; camera?: string; lens?: string }[] };

// 能投稿的身分；只有這些人會出現在攝影師頁
const POSTING_ROLES = ["photographer", "reviewer", "admin"];

const toId = (id: string) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

function toPhotographer(u: Document): Photographer {
  return {
    id: u._id.toString(),
    name: u.displayName || u.name || "",
    region: u.region ?? "",
    bio: u.bio ?? "",
    sports: u.sports ?? [],
    instagram: u.instagram || undefined,
    facebook: u.facebook || undefined,
    website: u.website || undefined,
    organization: u.organization || undefined,
    experience: u.experience || undefined,
    gear: u.gear || undefined,
    // 網址帶更新時間：換照片後瀏覽器才會抓新的，沒換就永久快取
    avatarUrl: u.avatarUpdatedAt ? `/api/avatar/${u._id}?v=${new Date(u.avatarUpdatedAt).getTime()}` : undefined,
  };
}

async function toWorks(docs: Document[]): Promise<Work[]> {
  const db = await getDb();
  const ids = [...new Set(docs.map((d) => String(d.photographerId)))].map(toId).filter((x) => x !== null);
  const users = await db.collection("users").find({ _id: { $in: ids } }, { projection: { avatar: 0 } }).toArray();
  const names = new Map(users.map((u) => [u._id.toString(), u.displayName || u.name || ""]));
  // 照片只拿「id 和尺寸」，大圖、縮圖的二進位資料不能帶出來
  const workIds = docs.map((d) => d._id.toString());
  const photoDocs = workIds.length
    ? await db.collection("photos").find({ workId: { $in: workIds } }, { projection: { full: 0, thumb: 0 } }).sort({ order: 1, createdAt: 1 }).toArray()
    : [];
  const byWork = new Map<string, Work["photos"]>();
  for (const p of photoDocs) byWork.set(p.workId, [...(byWork.get(p.workId) ?? []), { id: p._id.toString(), width: p.width ?? 0, height: p.height ?? 0, takenAt: p.exif?.takenAt, camera: p.exif?.camera, lens: p.exif?.lens }]);
  return docs.map((d) => ({
    id: d._id.toString(),
    title: d.title ?? "",
    photographerId: String(d.photographerId),
    photographerName: names.get(String(d.photographerId)) ?? "",
    sport: d.sport ?? "",
    event: d.event ?? "",
    date: d.date ?? "",
    location: d.location ?? "",
    description: d.description ?? "",
    status: d.status ?? "pending",
    rejectReason: d.rejectReason || undefined,
    resubmitted: !!d.resubmitted,
    featured: !!d.featured,
    eventId: d.eventId || undefined,
    likes: d.likeCount ?? 0,
    photos: byWork.get(d._id.toString()) ?? [],
  }));
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 公開頁面只顯示審核通過（status = approved）的作品
export async function listWorks(opts: { sport?: string; q?: string; photographerId?: string; featured?: boolean; event?: { id: string; name: string }; sort?: "popular" | "views"; limit?: number } = {}) {
  const filter: Document = { status: "approved" };
  if (opts.sport) filter.sport = opts.sport;
  if (opts.featured) filter.featured = true;
  if (opts.photographerId) filter.photographerId = opts.photographerId;
  // 賽事頁：作品是從賽事看板選的（eventId 相同），或賽事名稱填得一樣
  if (opts.event) filter.$or = [{ eventId: opts.event.id }, { event: opts.event.name }];
  if (opts.q) {
    const re = { $regex: escapeRegex(opts.q), $options: "i" };
    filter.$and = [{ $or: [{ title: re }, { event: re }, { location: re }] }];
  }
  const cursor = (await getDb()).collection("works").find(filter).sort(opts.sort === "popular" ? { likeCount: -1, createdAt: -1 } : opts.sort === "views" ? { viewCount: -1, likeCount: -1, createdAt: -1 } : { createdAt: -1 });
  if (opts.limit) cursor.limit(opts.limit);
  return toWorks(await cursor.toArray());
}

export async function getWork(id: string) {
  const _id = toId(id);
  if (!_id) return null;
  const doc = await (await getDb()).collection("works").findOne({ _id, status: "approved" });
  return doc ? (await toWorks([doc]))[0] : null;
}

export async function getPhotographer(id: string) {
  const _id = toId(id);
  if (!_id) return null;
  const doc = await (await getDb()).collection("users").findOne({ _id, role: { $in: POSTING_ROLES }, suspended: { $ne: true } }, { projection: { avatar: 0 } });
  return doc ? toPhotographer(doc) : null;
}

// 攝影師列表：只列出至少有一件已通過作品的人，並附上作品數
export async function listPhotographers() {
  const db = await getDb();
  const counts = await db.collection("works").aggregate<{ _id: string; count: number }>([
    { $match: { status: "approved" } },
    { $group: { _id: "$photographerId", count: { $sum: 1 } } },
  ]).toArray();
  const ids = counts.map((c) => toId(c._id)).filter((x) => x !== null);
  const users = await db.collection("users").find({ _id: { $in: ids }, role: { $in: POSTING_ROLES }, suspended: { $ne: true } }, { projection: { avatar: 0 } }).toArray();
  const countOf = new Map(counts.map((c) => [c._id, c.count]));
  return users.map((u) => ({ ...toPhotographer(u), workCount: countOf.get(u._id.toString()) ?? 0 }));
}

export async function getStats() {
  const db = await getDb();
  const [works, photographers] = await Promise.all([
    db.collection("works").countDocuments({ status: "approved" }),
    listPhotographers().then((l) => l.length),
  ]);
  return { works, photographers };
}

// 後台用：不限審核狀態。呼叫前一定要先用 requireRole 檢查權限
export async function listWorksForBackend(opts: { status?: string; photographerId?: string }) {
  const filter: Document = {};
  if (opts.status) filter.status = opts.status;
  if (opts.photographerId) filter.photographerId = opts.photographerId;
  const docs = await (await getDb()).collection("works").find(filter).sort({ createdAt: -1 }).toArray();
  return toWorks(docs);
}

export function toFullProfile(u: Document): FullProfile {
  return { ...toPhotographer(u), realName: u.realName ?? "", phone: u.phone ?? "", email: u.email ?? "", agreedAt: u.agreedAt };
}

// 填寫表單用：只給登入者本人看自己的完整資料
export async function getProfile(userId: string) {
  const _id = toId(userId);
  const doc = _id && (await (await getDb()).collection("users").findOne({ _id }, { projection: { avatar: 0 } }));
  return doc ? toFullProfile(doc) : null;
}

// 編輯用：只拿「自己的」作品，不限審核狀態
export async function getOwnWork(id: string, userId: string) {
  const _id = toId(id);
  if (!_id) return null;
  const doc = await (await getDb()).collection("works").findOne({ _id, photographerId: userId });
  return doc ? (await toWorks([doc]))[0] : null;
}

export type PhotographerStats = {
  works: number;
  photos: number;
  likes: number;
  sports: { sport: string; count: number }[]; // 各運動項目的作品數，多的排前面
  gear: { camera: string; count: number }[]; // 依 EXIF 統計各機身的照片數
  lenses: { lens: string; count: number }[];
};

// 攝影師個人頁的統計：只算已公開的作品
export async function getPhotographerStats(photographerId: string): Promise<PhotographerStats> {
  const db = await getDb();
  const works = await db.collection("works").find({ photographerId, status: "approved" }, { projection: { sport: 1, likeCount: 1 } }).toArray();
  const bySport = new Map<string, number>();
  let likes = 0;
  for (const w of works) {
    bySport.set(w.sport, (bySport.get(w.sport) ?? 0) + 1);
    likes += w.likeCount ?? 0;
  }
  const workIds = works.map((w) => w._id.toString());
  const photoCol = db.collection("photos");
  const group = (field: string) => photoCol.aggregate<{ _id: string; count: number }>([
    { $match: { workId: { $in: workIds }, [field]: { $exists: true, $ne: "" } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]).toArray();
  const [photos, gear, lenses] = workIds.length
    ? await Promise.all([photoCol.countDocuments({ workId: { $in: workIds } }), group("exif.camera"), group("exif.lens")])
    : [0, [], []];
  return {
    works: works.length,
    photos,
    likes,
    sports: [...bySport.entries()].map(([sport, count]) => ({ sport, count })).sort((a, b) => b.count - a.count),
    gear: gear.map((g) => ({ camera: g._id, count: g.count })),
    lenses: lenses.map((g) => ({ lens: g._id, count: g.count })),
  };
}

// 首頁輪播：點擊次數最多的作品（只取有照片的）；還沒有點擊紀錄時就依按讚數、最新排序
export async function listTopViewed(limit = 5) {
  return (await listWorks({ sort: "views", limit: limit * 4 })).filter((w) => w.photos.length > 0).slice(0, limit);
}
