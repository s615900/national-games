// 身分：訪客＝沒登入（不存資料庫）
// photographer_pending＝剛註冊、等管理員核准；photographer＝可投稿
export const ROLES = ["photographer_pending", "photographer", "reviewer", "admin"] as const;
export type Role = (typeof ROLES)[number];

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}

// 數字越大權限越高
const LEVEL: Record<Role, number> = {
  photographer_pending: 0,
  photographer: 1,
  reviewer: 2,
  admin: 3,
};

export function hasRole(role: Role | undefined, min: Role) {
  return !!role && LEVEL[role] >= LEVEL[min];
}
