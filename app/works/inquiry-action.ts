"use server";
import { ObjectId } from "mongodb";
import { connection } from "next/server";
import { INQUIRY_LIMIT_PER_HOUR, INQUIRY_MESSAGE_MAX, INQUIRY_PURPOSES } from "@/lib/inquiries";
import { getDb } from "@/lib/mongodb";
import { getViewerKey } from "@/lib/viewer";

export type InquiryState = { ok: boolean; message: string } | null;

export async function sendInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  await connection();
  if (formData.get("website")) return { ok: true, message: "已送出，攝影師看到後會與你聯絡。" }; // 機器人才會填的隱藏欄位
  const workId = String(formData.get("workId") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 30);
  const contact = String(formData.get("contact") ?? "").trim().slice(0, 100);
  const purpose = String(formData.get("purpose") ?? "");
  const message = String(formData.get("message") ?? "").trim().slice(0, INQUIRY_MESSAGE_MAX);

  if (!ObjectId.isValid(workId)) return { ok: false, message: "找不到這件作品。" };
  if (!name) return { ok: false, message: "請填寫你的稱呼。" };
  if (!contact) return { ok: false, message: "請留下 Email 或 LINE／電話，攝影師才找得到你。" };
  if (!INQUIRY_PURPOSES.some(([k]) => k === purpose)) return { ok: false, message: "請選擇用途。" };
  if (message.length < 5) return { ok: false, message: "請簡單說明你想要哪一張照片（至少 5 個字）。" };

  const db = await getDb();
  const work = await db.collection("works").findOne({ _id: new ObjectId(workId), status: "approved" }, { projection: { photographerId: 1, title: 1 } });
  if (!work) return { ok: false, message: "這件作品已不公開。" };

  const { key, userId } = await getViewerKey();
  const col = db.collection("inquiries");
  if ((await col.countDocuments({ key, createdAt: { $gt: new Date(Date.now() - 3600_000) } })) >= INQUIRY_LIMIT_PER_HOUR) {
    return { ok: false, message: "短時間內送出太多次，請稍後再試。" };
  }
  await col.insertOne({ workId, workTitle: work.title ?? "", photographerId: String(work.photographerId), name, contact, purpose, message, key, senderId: userId, read: false, createdAt: new Date() });
  return { ok: true, message: "已送出！攝影師會在後台看到你的留言，並用你留的方式與你聯絡。" };
}
