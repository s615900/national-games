import { getDb } from "@/lib/mongodb";

// 同一個人每小時最多按幾次讚（含取消），避免被拿來洗數字
export const LIKE_LIMIT_PER_HOUR = 60;

let indexed = false;
export async function likesCol() {
  const col = (await getDb()).collection("likes");
  if (!indexed) {
    await Promise.all([col.createIndex({ workId: 1, key: 1 }, { unique: true }), col.createIndex({ key: 1, createdAt: -1 })]);
    indexed = true;
  }
  return col;
}

export async function hasLiked(workId: string, key: string) {
  return !!(await (await likesCol()).findOne({ workId, key }, { projection: { _id: 1 } }));
}
