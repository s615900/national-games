import type { Photographer } from "@/lib/data";
import { sports } from "@/lib/sports";
import { saveProfile } from "@/app/dashboard/actions";

const input = "w-full rounded-lg border px-3 py-2";

// 申請時（等待核准）和核准後的後台共用同一份個人資料表單
export function ProfileForm({ profile }: { profile: Photographer | null }) {
  return (
    <form action={saveProfile} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="region" maxLength={20} defaultValue={profile?.region} placeholder="所在地區（例：台北市）" className={input} />
        <input name="instagram" maxLength={40} defaultValue={profile?.instagram} placeholder="Instagram 帳號（不用加 @）" className={input} />
      </div>
      <textarea name="bio" maxLength={300} rows={3} defaultValue={profile?.bio} placeholder="自我介紹" className={input} />
      <fieldset>
        <legend className="text-sm text-gray-500">擅長的運動</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {sports.map((s) => (
            <label key={s.slug} className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="sports" value={s.slug} defaultChecked={profile?.sports.includes(s.slug)} /> {s.emoji} {s.name}
            </label>
          ))}
        </div>
      </fieldset>
      <button className="rounded-lg bg-black px-5 py-2 text-white">儲存資料</button>
    </form>
  );
}

export const isProfileFilled = (p: Photographer | null) => !!p && !!(p.region || p.bio || p.instagram || p.sports.length);
