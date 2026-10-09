"use server";
import { createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { REPORT_DETAIL_MAX, REPORT_LIMIT_PER_HOUR, REPORT_REASONS } from "@/lib/reports";

export type ReportState = { ok: boolean; message: string } | null;

export async function reportWork(_prev: ReportState, formData: FormData): Promise<ReportState> {
  await connection();
  const workId = String(formData.get("workId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const detail = String(formData.get("detail") ?? "").trim().slice(0, REPORT_DETAIL_MAX);
  const contact = String(formData.get("contact") ?? "").trim().slice(0, 100);
  if (formData.get("website")) return { ok: true, message: "已收到檢舉，謝謝你。" }; // 機器人才會填的隱藏欄位，假裝成功就好

  if (!ObjectId.isValid(workId)) return { ok: false, message: "找不到這件作品。" };
  if (!REPORT_REASONS.some(([k]) => k === reason)) return { ok: false, message: "請選擇檢舉原因。" };
  if (reason === "other" && detail.length < 5) return { ok: false, message: "選「其他」時，請簡單說明原因。" };
  if (contact && !/^\S+@\S+\.\S+$/.test(contact)) return { ok: false, message: "聯絡信箱格式不正確（也可以留空）。" };

  const db = await getDb();
  const work = await db.collection("works").findOne({ _id: new ObjectId(workId), status: "approved" }, { projection: { _id: 1 } });
  if (!work) return { ok: false, message: "這件作品已不公開，不需要再檢舉。" };

  // 不存真正的 IP，只存加密後的指紋，用來擋重複與洗版
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  const ipHash = createHash("sha256").update(`${ip}|${process.env.AUTH_SECRET ?? ""}`).digest("hex").slice(0, 32);
  const reports = db.collection("reports");

  if (await reports.findOne({ workId, ipHash, status: "open" }, { projection: { _id: 1 } })) {
    return { ok: true, message: "你已經檢舉過這件作品，我們正在處理。" };
  }
  if ((await reports.countDocuments({ ipHash, createdAt: { $gt: new Date(Date.now() - 3600_000) } })) >= REPORT_LIMIT_PER_HOUR) {
    return { ok: false, message: "短時間內檢舉太多次，請稍後再試。" };
  }

  const session = await auth();
  await reports.insertOne({ workId, reason, detail, contact, ipHash, reporterId: session?.user?.id ?? null, status: "open", createdAt: new Date() });
  return { ok: true, message: "已收到檢舉，審核員會盡快查看。謝謝你。" };
}
