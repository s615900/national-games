// 後台各頁共用的樣式，改這裡全部一起變
export const btn = "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition";
export const btnPrimary = `${btn} bg-black text-white hover:bg-gray-800`;
export const btnOutline = `${btn} border border-gray-300 bg-white text-gray-800 hover:bg-gray-50`;
export const btnGhost = `${btn} text-gray-600 hover:bg-gray-100`;
export const btnDanger = `${btn} bg-red-600 text-white hover:bg-red-700`;
export const card = "rounded-2xl border bg-white shadow-sm";

export const WORK_STATUS: Record<string, { label: string; badge: string; num: string }> = {
  pending: { label: "審核中", badge: "bg-amber-50 text-amber-700 ring-amber-600/20", num: "text-amber-600" },
  approved: { label: "已公開", badge: "bg-green-50 text-green-700 ring-green-600/20", num: "text-green-600" },
  rejected: { label: "已退回", badge: "bg-red-50 text-red-700 ring-red-600/20", num: "text-red-600" },
};

export const ROLE_LABEL: Record<string, string> = {
  photographer_pending: "待核准",
  photographer: "攝影師",
  reviewer: "審核員",
  admin: "管理員",
};
export const ROLE_BADGE: Record<string, string> = {
  photographer_pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  photographer: "bg-gray-100 text-gray-700 ring-gray-500/20",
  reviewer: "bg-blue-50 text-blue-700 ring-blue-600/20",
  admin: "bg-purple-50 text-purple-700 ring-purple-600/20",
};
