"use server";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";
import { isRole } from "@/lib/roles";

// 只有管理員能改身分；每個動作都重新檢查，不信任前端
export async function setRole(formData: FormData) {
  const session = await requireRole("admin");
  const id = String(formData.get("id"));
  const role = formData.get("role");
  if (!ObjectId.isValid(id) || !isRole(role)) return;
  if (id === session.user.id) return; // 不能改自己，避免把自己降權
  await (await getDb()).collection("users").updateOne({ _id: new ObjectId(id) }, { $set: { role } });
  revalidatePath("/admin/users");
}

export async function setSuspended(formData: FormData) {
  const session = await requireRole("admin");
  const id = String(formData.get("id"));
  if (!ObjectId.isValid(id) || id === session.user.id) return;
  await (await getDb())
    .collection("users")
    .updateOne({ _id: new ObjectId(id) }, { $set: { suspended: formData.get("suspend") === "1" } });
  revalidatePath("/admin/users");
}
