"use server";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";

// 找出「作品已經不存在」的照片（孤兒照片）
export async function findOrphans() {
  const db = await getDb();
  const workIds = (await db.collection("photos").distinct("workId")) as string[];
  const valid = workIds.filter((w) => ObjectId.isValid(w));
  const alive = new Set((await db.collection("works").find({ _id: { $in: valid.map((w) => new ObjectId(w)) } }, { projection: { _id: 1 } }).toArray()).map((w) => w._id.toString()));
  const orphanWorkIds = workIds.filter((w) => !alive.has(w));
  if (orphanWorkIds.length === 0) return { ids: [] as string[], count: 0, bytes: 0 };
  const [r] = await db.collection("photos").aggregate<{ count: number; bytes: number }>([
    { $match: { workId: { $in: orphanWorkIds } } },
    { $group: { _id: null, count: { $sum: 1 }, bytes: { $sum: "$bytes" } } },
  ]).toArray();
  return { ids: orphanWorkIds, count: r?.count ?? 0, bytes: r?.bytes ?? 0 };
}

export async function cleanOrphans() {
  await requireRole("admin");
  const { ids, count } = await findOrphans();
  if (ids.length) await (await getDb()).collection("photos").deleteMany({ workId: { $in: ids } });
  revalidatePath("/admin/storage");
  redirect(`/admin/storage?cleaned=${count}`);
}
