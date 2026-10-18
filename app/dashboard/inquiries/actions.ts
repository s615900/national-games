"use server";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";

// 只能處理寄給自己的洽詢
export async function setInquiryRead(formData: FormData) {
  const session = await requireRole("photographer");
  const id = String(formData.get("id"));
  if (!ObjectId.isValid(id)) return;
  await (await getDb()).collection("inquiries").updateOne({ _id: new ObjectId(id), photographerId: session.user.id }, { $set: { read: formData.get("read") === "1" } });
  revalidatePath("/dashboard/inquiries");
  revalidatePath("/dashboard");
}

export async function deleteInquiry(formData: FormData) {
  const session = await requireRole("photographer");
  const id = String(formData.get("id"));
  if (!ObjectId.isValid(id)) return;
  await (await getDb()).collection("inquiries").deleteOne({ _id: new ObjectId(id), photographerId: session.user.id });
  revalidatePath("/dashboard/inquiries");
  revalidatePath("/dashboard");
}
