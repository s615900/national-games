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
    { $set: { status: "rejected", rejectReason: reason, reviewedBy: session.user.id, reviewedAt: new Date() } }
  );
  refresh();
}
