"use server";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";
import { sports } from "@/lib/sports";

const text = (fd: FormData, key: string, max: number) => String(fd.get(key) ?? "").trim().slice(0, max);

// 攝影師改自己的資料：身分一律取自登入狀態，不信任表單
export async function saveProfile(formData: FormData) {
  const session = await requireRole("photographer");
  const slugs = new Set(sports.map((s) => s.slug));
  const picked = formData.getAll("sports").map(String).filter((s) => slugs.has(s));
  await (await getDb()).collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: {
      region: text(formData, "region", 20),
      bio: text(formData, "bio", 300),
      instagram: text(formData, "instagram", 40).replace(/^@/, ""),
      sports: picked,
    } }
  );
  revalidatePath("/dashboard");
}

// 新增的作品一律是「待審核」，通過審核才會公開
export async function createWork(formData: FormData) {
  const session = await requireRole("photographer");
  const sport = text(formData, "sport", 30);
  const title = text(formData, "title", 50);
  const date = text(formData, "date", 10);
  if (!title || !sports.some((s) => s.slug === sport) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
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
