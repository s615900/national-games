import { COUNTIES, EXPERIENCES } from "@/lib/profile";
import type { FullProfile } from "@/lib/data";
import { sports } from "@/lib/sports";
import { saveProfile } from "@/app/dashboard/actions";

const input = "mt-1 w-full rounded-lg border px-3 py-2";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}{required && <span className="text-red-600"> *</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

// 申請時（等待核准）和核准後的後台共用同一份表單；from 決定儲存後回到哪一頁
export function ProfileForm({ profile, from, email }: { profile: FullProfile | null; from: "/pending" | "/dashboard"; email?: string | null }) {
  return (
    <form action={saveProfile} className="space-y-8">
      <input type="hidden" name="from" value={from} />

      <fieldset className="space-y-3">
        <legend className="text-lg font-bold">基本資料<span className="ml-2 text-xs font-normal text-gray-500">不會公開，只有管理員審核時看得到</span></legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="真實姓名" required><input name="realName" required maxLength={30} defaultValue={profile?.realName} className={input} /></Field>
          <Field label="手機號碼" required hint="例：0912345678"><input name="phone" required type="tel" inputMode="numeric" maxLength={14} defaultValue={profile?.phone} className={input} /></Field>
        </div>
        <Field label="Email" hint="使用 Google 登入的信箱，無法修改"><input value={email ?? profile?.email ?? ""} readOnly disabled className={`${input} bg-gray-100 text-gray-500`} /></Field>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-lg font-bold">公開資料<span className="ml-2 text-xs font-normal text-gray-500">會顯示在你的攝影師頁面</span></legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="顯示名稱" required hint="作品和攝影師頁面上顯示的名字，可以用暱稱或工作室名稱"><input name="displayName" required maxLength={30} defaultValue={profile?.name} className={input} /></Field>
          <Field label="所在縣市" required>
            <select name="region" required defaultValue={profile?.region ?? ""} className={input}>
              <option value="" disabled>請選擇</option>
              {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="所屬單位／媒體" hint="選填，例：○○日報、○○攝影工作室、自由接案"><input name="organization" maxLength={50} defaultValue={profile?.organization} className={input} /></Field>
          <Field label="攝影年資">
            <select name="experience" defaultValue={profile?.experience ?? ""} className={input}>
              <option value="">不公開</option>
              {EXPERIENCES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
        </div>
        <Field label="常用器材" hint="選填，例：Sony A9 III、70-200mm f/2.8"><input name="gear" maxLength={200} defaultValue={profile?.gear} className={input} /></Field>
        <Field label="自我介紹" hint="最多 300 字"><textarea name="bio" maxLength={300} rows={4} defaultValue={profile?.bio} className={input} /></Field>
        <fieldset>
          <legend className="text-sm font-medium">擅長的運動 <span className="text-red-600">*</span><span className="ml-2 text-xs font-normal text-gray-500">至少選一項</span></legend>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {sports.map((s) => (
              <label key={s.slug} className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="sports" value={s.slug} defaultChecked={profile?.sports.includes(s.slug)} /> {s.emoji} {s.name}
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-lg font-bold">社群與作品集連結<span className="ml-2 text-xs font-normal text-gray-500">選填，會顯示在攝影師頁面</span></legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Instagram 帳號" hint="不用加 @，貼上個人頁網址也可以"><input name="instagram" maxLength={80} defaultValue={profile?.instagram} className={input} /></Field>
          <Field label="Facebook 粉絲專頁／個人頁網址"><input name="facebook" type="url" maxLength={200} defaultValue={profile?.facebook} placeholder="https://" className={input} /></Field>
        </div>
        <Field label="個人網站／作品集網址"><input name="website" type="url" maxLength={200} defaultValue={profile?.website} placeholder="https://" className={input} /></Field>
      </fieldset>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="agree" required defaultChecked={!!profile?.agreedAt} className="mt-1" />
        <span>我同意本站使用我填寫的資料進行帳號審核與聯絡，並同意我上傳且通過審核的作品與公開資料展示在本站。 <span className="text-red-600">*</span></span>
      </label>

      <button className="rounded-lg bg-black px-6 py-2.5 text-white">儲存資料</button>
    </form>
  );
}

// 必填欄位都填了才算完成
export const isProfileComplete = (p: FullProfile | null) => !!p && !!(p.realName && p.phone && p.name && p.region && p.sports.length && p.agreedAt);

export function ProfileNotice({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>;
  if (saved) return <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">資料已儲存</p>;
  return null;
}
