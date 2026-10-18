// 洽詢原圖：選手、家長想要高解析原圖時，留言給攝影師（不公開攝影師的信箱）
export const INQUIRY_MESSAGE_MAX = 500;
export const INQUIRY_LIMIT_PER_HOUR = 3;
export const INQUIRY_PURPOSES = [
  ["personal", "個人／家人留念"],
  ["print", "沖洗列印"],
  ["media", "媒體、校刊或宣傳使用"],
  ["other", "其他"],
] as const;
export const purposeLabel = (key: string) => INQUIRY_PURPOSES.find(([k]) => k === key)?.[1] ?? "其他";
