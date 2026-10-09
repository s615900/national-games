"use server";
import { Binary, ObjectId } from "mongodb";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";
import { parseProfile } from "@/lib/profile";
import { parseWork } from "@/lib/work-form";

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
  const result = parseWork(formData);
  if ("error" in result) redirect(`/dashboard/works/new?error=${encodeURIComponent(result.error)}`);
  await (await getDb()).collection("works").insertOne({
    ...result.data,
    photographerId: session.user.id,
    status: "pending",
    createdAt: new Date(),
  });
  revalidatePath("/dashboard");
  revalidatePath("/review");
  redirect("/dashboard?created=1");
}

// 修改自己的作品。內容有改動就要重新審核（狀態回到審核中、清掉退回原因）；完全沒改就不動
export async function updateWork(formData: FormData) {
  const session = await requireRole("photographer");
  const id = String(formData.get("id"));
  if (!ObjectId.isValid(id)) redirect("/dashboard");
  const result = parseWork(formData);
  if ("error" in result) redirect(`/dashboard/works/${id}/edit?error=${encodeURIComponent(result.error)}`);

  const works = (await getDb()).collection("works");
  const _id = new ObjectId(id);
  const old = await works.findOne({ _id, photographerId: session.user.id }); // 只能改自己的
  if (!old) redirect("/dashboard");
  const d = result.data;
  const changed = (Object.keys(d) as (keyof typeof d)[]).some((k) => (old[k] ?? "") !== d[k]);
  if (!changed && old.status !== "rejected") redirect("/dashboard?updated=same");

  await works.updateOne(
    { _id, photographerId: session.user.id },
    { $set: { ...d, status: "pending", resubmitted: old.status !== "pending" || !!old.resubmitted, updatedAt: new Date() }, $unset: { rejectReason: "", reviewedBy: "", reviewedAt: "" } }
  );
  for (const p of ["/dashboard", "/review", "/works", "/photographers", "/"]) revalidatePath(p);
  redirect(`/dashboard?updated=${old.status === "approved" ? "resubmitted" : "saved"}`);
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

const AVATAR_MAX = 5 * 1024 * 1024;

// 上傳大頭貼：伺服器自己重新處理圖片（裁成 256×256 正方形、轉 webp），不直接存使用者給的檔案
export async function saveAvatar(formData: FormData) {
  const session = await requireRole("photographer_pending");
  const f = formData.get("from");
  const from = f === "/pending" ? "/pending" : "/dashboard/profile";
  const back = (q: string) => redirect(`${from}?${q}`);
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) back(`error=${encodeURIComponent("請先選擇一張圖片")}`);
  const upload = file as File;
  if (upload.size > AVATAR_MAX) back(`error=${encodeURIComponent("圖片太大，請選 5MB 以下的檔案")}`);

  let out: Buffer;
  try {
    out = await sharp(Buffer.from(await upload.arrayBuffer()), { limitInputPixels: 50_000_000 })
      .rotate() // 依照片方向自動轉正
      .resize(256, 256, { fit: "cover", position: "attention" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return back(`error=${encodeURIComponent("無法讀取這個檔案，請選 JPG、PNG 或 WebP 圖片")}`);
  }
  await (await getDb()).collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: { avatar: new Binary(out), avatarUpdatedAt: new Date() } }
  );
  for (const p of ["/dashboard", "/dashboard/profile", "/pending", "/admin/users", "/photographers"]) revalidatePath(p);
  back("saved=avatar");
}

export async function removeAvatar(formData: FormData) {
  const session = await requireRole("photographer_pending");
  const from = formData.get("from") === "/pending" ? "/pending" : "/dashboard/profile";
  await (await getDb()).collection("users").updateOne({ _id: new ObjectId(session.user.id) }, { $unset: { avatar: "", avatarUpdatedAt: "" } });
  for (const p of ["/dashboard", "/dashboard/profile", "/pending", "/admin/users", "/photographers"]) revalidatePath(p);
  redirect(`${from}?saved=avatar`);
}
