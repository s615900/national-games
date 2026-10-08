import { sports } from "@/lib/sports";

export const COUNTIES = ["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市", "基隆市", "新竹市", "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣", "海外"];
export const EXPERIENCES = ["1 年以下", "1–3 年", "3–5 年", "5–10 年", "10 年以上"];

export type ProfileInput = {
  realName: string; phone: string; displayName: string; region: string; organization: string;
  experience: string; gear: string; bio: string; sports: string[]; instagram: string; facebook: string; website: string;
};

const text = (fd: FormData, key: string, max: number) => String(fd.get(key) ?? "").trim().slice(0, max);

// 只接受 http(s) 網址，避免有人塞 javascript: 之類的連結到公開頁面
function toUrl(raw: string): string | null {
  if (!raw) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

// 伺服器端驗證：不信任瀏覽器送來的內容
export function parseProfile(fd: FormData): { data: ProfileInput } | { error: string } {
  const realName = text(fd, "realName", 30);
  const phone = text(fd, "phone", 20).replace(/[\s-]/g, "");
  const displayName = text(fd, "displayName", 30);
  const region = text(fd, "region", 10);
  const slugs = new Set(sports.map((s) => s.slug));
  const picked = [...new Set(fd.getAll("sports").map(String))].filter((s) => slugs.has(s));
  const instagram = text(fd, "instagram", 40).replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/.*$/, "");
  const facebook = toUrl(text(fd, "facebook", 200));
  const website = toUrl(text(fd, "website", 200));
  const experience = text(fd, "experience", 20);

  if (!realName) return { error: "請填寫真實姓名" };
  if (!/^09\d{8}$/.test(phone)) return { error: "手機號碼格式不正確（例：0912345678）" };
  if (!displayName) return { error: "請填寫顯示名稱" };
  if (!COUNTIES.includes(region)) return { error: "請選擇所在縣市" };
  if (picked.length === 0) return { error: "請至少選一項擅長的運動" };
  if (instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) return { error: "Instagram 帳號只能有英數字、底線和點" };
  if (facebook === null) return { error: "Facebook 連結格式不正確" };
  if (website === null) return { error: "個人網站連結格式不正確" };
  if (experience && !EXPERIENCES.includes(experience)) return { error: "攝影年資選項不正確" };
  if (fd.get("agree") !== "on") return { error: "請勾選同意事項" };

  return {
    data: {
      realName, phone, displayName, region, experience, sports: picked, instagram, facebook, website,
      organization: text(fd, "organization", 50),
      gear: text(fd, "gear", 200),
      bio: text(fd, "bio", 300),
    },
  };
}
