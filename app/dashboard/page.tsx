import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { isProfileComplete } from "@/components/ProfileForm";
import { getProfile, listWorksForBackend } from "@/lib/data";
import { requireRole } from "@/lib/guard";
import { hasRole } from "@/lib/roles";
import { getSport } from "@/lib/sports";
import { deleteWork } from "./actions";

const STATUS: Record<string, { label: string; badge: string; num: string }> = {
  pending: { label: "審核中", badge: "bg-amber-50 text-amber-700 ring-amber-600/20", num: "text-amber-600" },
  approved: { label: "已公開", badge: "bg-green-50 text-green-700 ring-green-600/20", num: "text-green-600" },
  rejected: { label: "已退回", badge: "bg-red-50 text-red-700 ring-red-600/20", num: "text-red-600" },
};
const ROLE_LABEL: Record<string, string> = { photographer: "攝影師", reviewer: "審核員", admin: "管理員" };

const btn = "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition";
const btnPrimary = `${btn} bg-black text-white hover:bg-gray-800`;
const btnOutline = `${btn} border border-gray-300 bg-white text-gray-800 hover:bg-gray-50`;
const btnGhost = `${btn} text-gray-600 hover:bg-gray-100`;

async function DashboardPageContent({ searchParams }: PageProps<"/dashboard">) {
  const session = await requireRole("photographer_pending");
  const role = session.user.role!;
  if (role === "photographer_pending") redirect("/pending");
  const sp = await searchParams;
  const filter = typeof sp.status === "string" && sp.status in STATUS ? sp.status : "";
  const [profile, works] = await Promise.all([getProfile(session.user.id), listWorksForBackend({ photographerId: session.user.id })]);

  const count = (s: string) => works.filter((w) => w.status === s).length;
  const shown = filter ? works.filter((w) => w.status === filter) : works;
  const displayName = profile?.name || session.user.name || "";
  const tabs = [["", "全部", works.length], ["pending", "審核中", count("pending")], ["approved", "已公開", count("approved")], ["rejected", "已退回", count("rejected")]] as const;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex flex-col gap-5 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-xl font-bold text-white">{displayName.slice(0, 1) || "?"}</div>
          <div>
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{ROLE_LABEL[role]}</span>
              {[profile?.organization, profile?.region].filter(Boolean).join("・")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/works/new" className={btnPrimary}>＋ 新增作品</Link>
          {profile && <Link href={`/photographers/${profile.id}`} className={btnOutline}>我的公開頁面</Link>}
          <Link href="/dashboard/profile" className={btnOutline}>編輯個人資料</Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button className={btnGhost}>登出</button>
          </form>
        </div>
      </header>

      {hasRole(role, "reviewer") && (
        <nav className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed bg-gray-50 px-4 py-3 text-sm">
          <span className="font-medium text-gray-500">管理工具</span>
          <Link href="/review" className={btnOutline}>審核作品</Link>
          {hasRole(role, "admin") && <Link href="/admin/users" className={btnOutline}>帳號管理</Link>}
        </nav>
      )}

      {sp.created && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">作品已送出，審核通過後就會公開。</p>}
      {!isProfileComplete(profile) && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          個人資料還沒填完整，<Link href="/dashboard/profile" className="font-medium underline">前往補齊必填欄位</Link>。
        </p>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["全部作品", works.length, "text-gray-900"], ["審核中", count("pending"), STATUS.pending.num], ["已公開", count("approved"), STATUS.approved.num], ["已退回", count("rejected"), STATUS.rejected.num]].map(([label, n, cls]) => (
          <div key={label as string} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${cls}`}>{n}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
          <h2 className="text-lg font-bold">我的作品</h2>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 text-sm">
            {tabs.map(([key, label, n]) => (
              <Link key={key} href={key ? `/dashboard?status=${key}` : "/dashboard"} className={`rounded-md px-3 py-1 transition ${filter === key ? "bg-white font-medium shadow-sm" : "text-gray-600 hover:text-black"}`}>
                {label} <span className="text-gray-400">{n}</span>
              </Link>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-4xl">📷</p>
            <p className="mt-3 font-medium">{works.length === 0 ? "還沒有作品" : "這個狀態下沒有作品"}</p>
            <p className="mt-1 text-sm text-gray-500">{works.length === 0 ? "新增你的第一件作品，審核通過後就會公開。" : "切換上方的分類看看其他作品。"}</p>
            {works.length === 0 && <Link href="/dashboard/works/new" className={`${btnPrimary} mt-5`}>＋ 新增第一件作品</Link>}
          </div>
        ) : (
          <ul className="divide-y">
            {shown.map((w) => {
              const sport = getSport(w.sport);
              const st = STATUS[w.status] ?? STATUS.pending;
              return (
                <li key={w.id} className="flex items-start gap-4 px-6 py-4">
                  <div className={`flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${sport?.color ?? "from-gray-300 to-gray-500"} text-2xl`}>{sport?.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold">{w.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${st.badge}`}>{st.label}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{[sport?.name, w.event, w.location, w.date].filter(Boolean).join("・")}</p>
                    {w.status === "rejected" && w.rejectReason && (
                      <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"><span className="font-medium">退回原因：</span>{w.rejectReason}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-sm">
                    {w.status === "approved" && <Link href={`/works/${w.id}`} className={btnGhost}>查看</Link>}
                    <details className="relative">
                      <summary className={`${btnGhost} cursor-pointer list-none text-red-600 hover:bg-red-50`}>刪除</summary>
                      <div className="absolute right-0 z-10 mt-1 w-52 rounded-xl border bg-white p-4 shadow-lg">
                        <p className="text-sm">確定要刪除這件作品嗎？刪除後無法復原。</p>
                        <form action={deleteWork} className="mt-3">
                          <input type="hidden" name="id" value={w.id} />
                          <button className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">確定刪除</button>
                        </form>
                      </div>
                    </details>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <Suspense>
      <DashboardPageContent {...props} />
    </Suspense>
  );
}
