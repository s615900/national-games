import { sports } from "@/lib/sports";

export type WorkInput = { title: string; sport: string; date: string; event: string; location: string; description: string };

const text = (fd: FormData, key: string, max: number) => String(fd.get(key) ?? "").trim().slice(0, max);

// 新增、修改作品共用的驗證（伺服器端，不信任瀏覽器）
export function parseWork(fd: FormData): { data: WorkInput } | { error: string } {
  const title = text(fd, "title", 50);
  const sport = text(fd, "sport", 30);
  const date = text(fd, "date", 10);
  if (!title) return { error: "請填寫作品標題" };
  if (!sports.some((s) => s.slug === sport)) return { error: "請選擇運動項目" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return { error: "請選擇正確的拍攝日期" };
  return { data: { title, sport, date, event: text(fd, "event", 50), location: text(fd, "location", 50), description: text(fd, "description", 500) } };
}
