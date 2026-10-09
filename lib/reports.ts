// 檢舉：任何人都能檢舉已公開的作品，審核員在「檢舉處理」頁決定下架或駁回
export const REPORT_REASONS = [
  ["copyright", "侵權／盜用他人照片"],
  ["privacy", "未經同意拍攝或公開個人"],
  ["inappropriate", "不當內容"],
  ["misleading", "資訊不實"],
  ["other", "其他"],
] as const;

export const reasonLabel = (key: string) => REPORT_REASONS.find(([k]) => k === key)?.[1] ?? "其他";

// 同一個人（以網路位址辨識）每小時最多檢舉幾次，避免被拿來洗版
export const REPORT_LIMIT_PER_HOUR = 5;
export const REPORT_DETAIL_MAX = 500;
