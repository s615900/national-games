import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { getProfile, listWorksForBackend } from "@/lib/data";
import { requireRole } from "@/lib/guard";
import { hasRole } from "@/lib/roles";
import { getSport, sports } from "@/lib/sports";
import { createWork, deleteWork, saveProfile } from "./actions";

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "審核中", cls: "bg-amber-100 text-amber-800" },
  approved: { label: "已公開", cls: "bg-green-100 text-green-800" },
  rejected: { label: "已退回", cls: "bg-red-100 text-red-800" },
};

const input = "w-full rounded-lg border px-3 py-2";

async function DashboardPageContent() {
  const session = await requireRole("photographer_pending");
  const role = session.user.role!;
  if (role === "photographer_pending") redirect("/pending");
  const [profile, works] = await Promise.all([getProfile(session.user.id), listWorksForBackend({ photographerId: session.user.id })]);

  return (
    <main className="mx-auto max-w-3xl space-y-10 p-6">
      <header>
        <h1 className="text-2xl font-bold">攝影師後台</h1>
        <p className="mt-1 text-gray-500">你好，{session.user.name}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          {hasRole(role, "reviewer") && <Link className="underline" href="/review">審核後台</Link>}
          {hasRole(role, "admin") && <Link className="underline" href="/admin/users">帳號管理</Link>}
          {profile && <Link className="underline" href={`/photographers/${profile.id}`}>我的公開頁面</Link>}
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className="underline">登出</button>
          </form>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-bold">我的作品（{works.length}）</h2>
        {works.length === 0 && <p className="mt-3 text-gray-500">還沒有作品，從下方「新增作品」開始。</p>}
        <ul className="mt-3 space-y-3">
          {works.map((w) => {
            const st = STATUS[w.status] ?? STATUS.pending;
            return (
              <li key={w.id} className="flex items-start justify-between gap-3 rounded-xl border p-4">
                <div>
                  <p className="font-semibold">{w.title} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${st.cls}`}>{st.label}</span></p>
                  <p className="text-sm text-gray-500">{getSport(w.sport)?.name}・{w.event || "未填賽事"}・{w.date}</p>
                  {w.status === "rejected" && w.rejectReason && <p className="mt-1 text-sm text-red-600">退回原因：{w.rejectReason}</p>}
                </div>
                <form action={deleteWork}>
                  <input type="hidden" name="id" value={w.id} />
                  <button className="text-sm text-gray-500 underline">刪除</button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold">新增作品</h2>
        <p className="mt-1 text-sm text-gray-500">送出後會進入審核，通過才會公開。照片上傳功能之後開放。</p>
        <form action={createWork} className="mt-3 space-y-3">
          <input name="title" required maxLength={50} placeholder="作品標題" className={input} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select name="sport" required defaultValue="" className={input}>
              <option value="" disabled>選擇運動項目</option>
              {sports.map((s) => <option key={s.slug} value={s.slug}>{s.emoji} {s.name}</option>)}
            </select>
            <input name="date" type="date" required className={input} />
            <input name="event" maxLength={50} placeholder="賽事名稱" className={input} />
            <input name="location" maxLength={50} placeholder="地點" className={input} />
          </div>
          <textarea name="description" maxLength={500} rows={3} placeholder="拍攝故事、器材等說明" className={input} />
          <button className="rounded-lg bg-black px-5 py-2 text-white">送出審核</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-bold">個人資料</h2>
        <p className="mt-1 text-sm text-gray-500">會顯示在你的公開頁面（有作品通過審核後才會出現在攝影師列表）。</p>
        <form action={saveProfile} className="mt-3 space-y-3">
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
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageContent />
    </Suspense>
  );
}
