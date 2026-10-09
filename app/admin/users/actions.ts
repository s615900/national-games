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

// 永久刪除帳號：連同他的作品、照片和這些作品收到的檢舉一起刪（不能刪自己）
export async function deleteUser(formData: FormData) {
  const session = await requireRole("admin");
  const id = String(formData.get("id"));
  if (!ObjectId.isValid(id) || id === session.user.id) return;
  const db = await getDb();
  const workIds = (await db.collection("works").find({ photographerId: id }, { projection: { _id: 1 } }).toArray()).map((w) => w._id.toString());
  await db.collection("photos").deleteMany({ $or: [{ ownerId: id }, { workId: { $in: workIds } }] });
  await db.collection("reports").deleteMany({ workId: { $in: workIds } });
  await db.collection("works").deleteMany({ photographerId: id });
  await db.collection("users").deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/users");
}
