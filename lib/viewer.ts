import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/auth";

// 辨識「是誰」：登入的人用帳號 id；沒登入的用加密後的網路位址指紋（不存真實 IP）
export async function getViewerKey() {
  const session = await auth();
  if (session?.user?.id) return { key: `u:${session.user.id}`, userId: session.user.id };
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  return { key: `ip:${createHash("sha256").update(`${ip}|${process.env.AUTH_SECRET ?? ""}`).digest("hex").slice(0, 32)}`, userId: null };
}
