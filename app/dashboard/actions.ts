"use server";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";
import { parseProfile } from "@/lib/profile";
import { sports } from "@/lib/sports";

const text = (fd: FormData, key: string, max: number) => String(fd.get(key) ?? "").trim().slice(0, max);

// 改自己的資料：身分一律取自登入狀態，不信任表單。填不完整就退回並說明原因
export async function saveProfile(formData: FormData) {
  const session = await requireRole("photographer_pending"); // 申請時就要能填
  const f = formData.get("from");
  const from = f === "/pending" || f === "/dashboard/profile" ? f : "/dashboard"; // 只允許回到這幾頁
  const result = parseProfile(formData);
  if ("error" in result) redirect(`${from}?error=${encodeURIComponent(result.error)}`);
  const users = (await getDb()).collection("users");
  const _id = new ObjectId(session.user.id);
  const me = await users.findOne({ _id }, { projection: { agreedAt: 1 } });
  await users.updateOne({ _id }, { $set: { ...result.data, agreedAt: me?.agreedAt ?? new Date(), profileUpdatedAt: new Date() } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/pending");
  revalidatePath("/admin/users");
  redirect(`${from}?saved=1`);
}

// 新增的作品一律是「待審核」，通過審核才會公開。填錯就退回表單並說明原因
export async function createWork(formData: FormData) {
  const session = await requireRole("photographer");
  const sport = text(formData, "sport", 30);
  const title = text(formData, "title", 50);
  const date = text(formData, "date", 10);
  const fail = (msg: string) => redirect(`/dashboard/works/new?error=${encodeURIComponent(msg)}`);
  if (!title) fail("請填寫作品標題");
  if (!sports.some((s) => s.slug === sport)) fail("請選擇運動項目");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) fail("請選擇正確的拍攝日期");
  await (await getDb()).collection("works").insertOne({
    title,
    sport,
    date,
    event: text(formData, "event", 50),
    location: text(formData, "location", 50),
    description: text(formData, "description", 500),
    photographerId: session.user.id,
    status: "pending",
    createdAt: new Date(),
  });
  revalidatePath("/dashboard");
  revalidatePath("/review");
  redirect("/dashboard?created=1");
}

// 只能刪自己的作品
export async function deleteWork(formData: FormData) {
  const session = await requireRole("photographer");
  const id = String(formData.get("id"));
  if (!ObjectId.isValid(id)) return;
  await (await getDb()).collection("works").deleteOne({ _id: new ObjectId(id), photographerId: session.user.id });
  revalidatePath("/dashboard");
  revalidatePath("/works");
  revalidatePath("/");
}
