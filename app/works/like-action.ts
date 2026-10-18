"use server";
import { ObjectId } from "mongodb";
import { connection } from "next/server";
import { LIKE_LIMIT_PER_HOUR, likesCol } from "@/lib/likes";
import { getDb } from "@/lib/mongodb";
import { getViewerKey } from "@/lib/viewer";

export type LikeResult = { ok: boolean; liked: boolean; count: number; message?: string };

// 按讚／取消讚（再按一次就取消）。只有已公開的作品能按；計數存在 works.likeCount，方便排序
export async function toggleLike(workId: string): Promise<LikeResult> {
  await connection();
  if (!ObjectId.isValid(workId)) return { ok: false, liked: false, count: 0, message: "找不到這件作品" };
  const works = (await getDb()).collection("works");
  const work = await works.findOne({ _id: new ObjectId(workId), status: "approved" }, { projection: { likeCount: 1 } });
  if (!work) return { ok: false, liked: false, count: 0, message: "這件作品已不公開" };

  const { key } = await getViewerKey();
  const likes = await likesCol();
  const current = work.likeCount ?? 0;
  if ((await likes.countDocuments({ key, createdAt: { $gt: new Date(Date.now() - 3600_000) } })) >= LIKE_LIMIT_PER_HOUR) {
    return { ok: false, liked: !!(await likes.findOne({ workId, key })), count: current, message: "操作太頻繁，請稍後再試" };
  }

  const removed = await likes.deleteOne({ workId, key });
  if (removed.deletedCount) {
    const r = await works.findOneAndUpdate({ _id: new ObjectId(workId) }, { $inc: { likeCount: -1 } }, { returnDocument: "after", projection: { likeCount: 1 } });
    return { ok: true, liked: false, count: Math.max(0, r?.likeCount ?? 0) };
  }
  try {
    await likes.insertOne({ workId, key, createdAt: new Date() });
  } catch {
    return { ok: true, liked: true, count: current }; // 同時連按兩下，另一筆已經寫入
  }
  const r = await works.findOneAndUpdate({ _id: new ObjectId(workId) }, { $inc: { likeCount: 1 } }, { returnDocument: "after", projection: { likeCount: 1 } });
  return { ok: true, liked: true, count: r?.likeCount ?? current + 1 };
}
