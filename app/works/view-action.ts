"use server";
import { ObjectId } from "mongodb";
import { connection } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getViewerKey } from "@/lib/viewer";

// 記一次作品點擊（首頁輪播依此排序）。同一個人同一天對同一件作品只算一次；明細 2 天後自動清掉
export async function recordView(workId: string) {
  await connection();
  if (!ObjectId.isValid(workId)) return;
  const db = await getDb();
  const views = db.collection("views");
  await views.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2 * 86400 });
  await views.createIndex({ workId: 1, key: 1, day: 1 }, { unique: true });
  const { key } = await getViewerKey();
  const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
  try {
    await views.insertOne({ workId, key, day, createdAt: new Date() });
  } catch {
    return; // 今天已經算過了
  }
  await db.collection("works").updateOne({ _id: new ObjectId(workId), status: "approved" }, { $inc: { viewCount: 1 } });
}
