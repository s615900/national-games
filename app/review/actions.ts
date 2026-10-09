"use server";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";

function refresh() {
  for (const p of ["/review", "/dashboard", "/works", "/photographers", "/"]) revalidatePath(p);
}

export async function approveWork(formData: FormData) {
  const session = await requireRole("reviewer");
  const id = String(formData.get("id"));
  if (!ObjectId.isValid(id)) return;
  await (await getDb()).collection("works").updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "approved", reviewedBy: session.user.id, reviewedAt: new Date() }, $unset: { rejectReason: "" } }
  );
  refresh();
}

export async function rejectWork(formData: FormData) {
  const session = await requireRole("reviewer");
  const id = String(formData.get("id"));
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 200);
  if (!ObjectId.isValid(id) || !reason) return; // 退回一定要寫原因，攝影師才知道怎麼改
  await (await getDb()).collection("works").updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "rejected", rejectReason: reason, reviewedBy: session.user.id, reviewedAt: new Date() }, $unset: { featured: "" } }
  );
  refresh();
}

// 審核員直接下架已公開的作品：退回給攝影師（原因必填），該作品待處理的檢舉順便結案
export async function unpublishWork(formData: FormData) {
  const session = await requireRole("reviewer");
  const id = String(formData.get("id"));
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 200);
  if (!ObjectId.isValid(id) || !reason) return;
  const db = await getDb();
  const now = new Date();
  const { matchedCount } = await db.collection("works").updateOne(
    { _id: new ObjectId(id), status: "approved" },
    { $set: { status: "rejected", rejectReason: `已下架：${reason}`, reviewedBy: session.user.id, reviewedAt: now }, $unset: { featured: "" } }
  );
  if (matchedCount) {
    await db.collection("reports").updateMany(
      { workId: id, status: "open" },
      { $set: { status: "resolved", handledBy: session.user.id, handledAt: now, note: `審核員直接下架：${reason}` } }
    );
  }
  refresh();
}

// 只有管理員能決定哪些作品放在首頁「精選作品」；只有已公開的作品能被精選
export async function setFeatured(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id"));
  if (!ObjectId.isValid(id)) return;
  const on = formData.get("featured") === "1";
  await (await getDb()).collection("works").updateOne(
    { _id: new ObjectId(id), status: "approved" },
    on ? { $set: { featured: true } } : { $unset: { featured: "" } }
  );
  refresh();
}
