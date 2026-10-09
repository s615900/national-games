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
export type Work = { id: string; title: string; photographerId: string; photographerName: string; sport: string; event: string; date: string; location: string; description: string; status: string; rejectReason?: string };

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
  const ids = [...new Set(docs.map((d) => String(d.photographerId)))].map(toId).filter((x) => x !== null);
  const users = await (await getDb()).collection("users").find({ _id: { $in: ids } }, { projection: { avatar: 0 } }).toArray();
  const names = new Map(users.map((u) => [u._id.toString(), u.displayName || u.name || ""]));
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
  }));
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 公開頁面只顯示審核通過（status = approved）的作品
export async function listWorks(opts: { sport?: string; q?: string; photographerId?: string; limit?: number } = {}) {
  const filter: Document = { status: "approved" };
  if (opts.sport) filter.sport = opts.sport;
  if (opts.photographerId) filter.photographerId = opts.photographerId;
  if (opts.q) {
    const re = { $regex: escapeRegex(opts.q), $options: "i" };
    filter.$or = [{ title: re }, { event: re }, { location: re }];
  }
  const cursor = (await getDb()).collection("works").find(filter).sort({ createdAt: -1 });
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
