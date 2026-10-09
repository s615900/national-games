"use server";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";

function refresh() {
  for (const p of ["/review", "/review/reports", "/dashboard", "/works", "/photographers", "/"]) revalidatePath(p);
}

// 檢舉成立：作品下架（退回給攝影師，原因寫進去），這件作品所有待處理的檢舉一起結案
export async function takedownWork(formData: FormData) {
  const session = await requireRole("reviewer");
  const workId = String(formData.get("workId"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 200);
  if (!ObjectId.isValid(workId) || !note) return;
  const db = await getDb();
  const now = new Date();
  await db.collection("works").updateOne(
    { _id: new ObjectId(workId) },
    { $set: { status: "rejected", rejectReason: `因檢舉下架：${note}`, reviewedBy: session.user.id, reviewedAt: now } }
  );
  await db.collection("reports").updateMany(
    { workId, status: "open" },
    { $set: { status: "resolved", handledBy: session.user.id, handledAt: now, note } }
  );
  refresh();
}

// 檢舉不成立：只結案這一筆，作品維持公開
export async function dismissReport(formData: FormData) {
  const session = await requireRole("reviewer");
  const id = String(formData.get("id"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 200);
  if (!ObjectId.isValid(id)) return;
  await (await getDb()).collection("reports").updateOne(
    { _id: new ObjectId(id), status: "open" },
    { $set: { status: "dismissed", handledBy: session.user.id, handledAt: new Date(), note } }
  );
  refresh();
}
