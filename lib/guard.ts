import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { hasRole, type Role } from "@/lib/roles";

// 每個受保護頁面／動作都要呼叫：沒登入送去登入，權限不足送回首頁
export async function requireRole(min: Role) {
  await connection(); // 登入狀態只能在有人瀏覽時讀取
  const session = await auth();
  if (!session?.user?.role) redirect("/login");
  if (!hasRole(session.user.role, min)) redirect("/");
  return session;
}
