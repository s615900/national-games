import { Suspense } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { toFullProfile } from "@/lib/data";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";
import { ROLES } from "@/lib/roles";
import { getSport } from "@/lib/sports";
import { ROLE_BADGE, ROLE_LABEL, btnDanger, btnGhost, btnOutline, card } from "@/lib/ui";
import { deleteUser, setRole, setSuspended } from "./actions";

const FILTERS = [["", "全部"], ["photographer_pending", "待核准"], ["photographer", "攝影師"], ["reviewer", "審核員"], ["admin", "管理員"], ["suspended", "已停權"]] as const;
const fmt = (d?: Date | string) => (d ? new Date(d).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }) : "—");
const field = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10";

async function AdminUsersPageContent({ searchParams }: PageProps<"/admin/users">) {
  const session = await requireRole("admin");
  const sp = await searchParams;
  const filter = typeof sp.role === "string" ? sp.role : "";
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";

  const all = await (await getDb()).collection("users").find({}, { projection: { avatar: 0 } }).sort({ createdAt: -1 }).toArray();
  // 待核准的排最前面，方便處理
  all.sort((a, b) => Number(b.role === "photographer_pending") - Number(a.role === "photographer_pending"));
  const matches = (u: (typeof all)[number], f: string) => (f === "suspended" ? !!u.suspended : f ? u.role === f : true);
  const count = (f: string) => all.filter((u) => matches(u, f)).length;
  const users = all.filter((u) => matches(u, filter) && (!q || `${u.name}${u.displayName ?? ""}${u.email}${u.realName ?? ""}`.toLowerCase().includes(q)));
  const pending = count("photographer_pending");

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className={`${card} flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between`}>
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">← 回後台</Link>
          <h1 className="mt-1 text-2xl font-bold">帳號管理</h1>
          <p className="mt-1 text-sm text-gray-500">{pending > 0 ? `有 ${pending} 位攝影師等待核准` : "目前沒有待核准的帳號"}</p>
        </div>
        <div className="flex gap-2"><Link href="/review" className={btnOutline}>審核作品</Link><Link href="/admin/storage" className={btnOutline}>照片空間</Link></div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[["全部帳號", count(""), "text-gray-900"], ["待核准", pending, "text-amber-600"], ["攝影師", count("photographer"), "text-gray-900"], ["審核員", count("reviewer"), "text-blue-600"], ["已停權", count("suspended"), "text-red-600"]].map(([label, n, cls]) => (
          <div key={label as string} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${cls}`}>{n}</p>
          </div>
        ))}
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
          <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1 text-sm">
            {FILTERS.map(([key, label]) => (
              <Link key={key} href={`/admin/users?${new URLSearchParams({ ...(key && { role: key }), ...(q && { q }) })}`} className={`rounded-md px-3 py-1 transition ${filter === key ? "bg-white font-medium shadow-sm" : "text-gray-600 hover:text-black"}`}>
                {label} <span className="text-gray-400">{count(key)}</span>
              </Link>
            ))}
          </div>
          <form className="flex gap-2">
            {filter && <input type="hidden" name="role" value={filter} />}
            <input name="q" defaultValue={sp.q as string | undefined} placeholder="搜尋姓名或信箱" className={`${field} w-48`} />
            <button className={btnOutline}>搜尋</button>
          </form>
        </div>

        {users.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 font-medium">找不到符合的帳號</p>
          </div>
        ) : (
          <ul className="divide-y">
            {users.map((u) => {
              const id = u._id.toString();
              const isMe = id === session.user.id;
              const pf = toFullProfile(u);
              const isPending = u.role === "photographer_pending";
              return (
                <li key={id} className={`px-6 py-5 ${isPending ? "bg-amber-50/40" : ""}`}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={pf.name} src={pf.avatarUrl} className="h-12 w-12 text-lg" />
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 font-semibold">
                          <span className="truncate">{pf.name || u.name}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_BADGE[u.role] ?? ""}`}>{ROLE_LABEL[u.role] ?? u.role}</span>
                          {u.suspended && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">已停權</span>}
                          {isMe && <span className="text-xs font-normal text-gray-400">（你）</span>}
                        </p>
                        <p className="truncate text-sm text-gray-500">{u.email}</p>
                        <p className="text-xs text-gray-400">上次登入：{fmt(u.lastLoginAt)}・註冊：{fmt(u.createdAt)}</p>
                      </div>
                    </div>

                    {!isMe && (
                      <div className="flex flex-wrap items-center gap-2">
                        {isPending && (
                          <form action={setRole}>
                            <input type="hidden" name="id" value={id} />
                            <input type="hidden" name="role" value="photographer" />
                            <button className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">✓ 核准為攝影師</button>
                          </form>
                        )}
                        <form action={setRole} className="flex gap-1.5">
                          <input type="hidden" name="id" value={id} />
                          <select name="role" defaultValue={u.role} aria-label="身分" className={field}>
                            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                          </select>
                          <button className={btnOutline}>變更身分</button>
                        </form>
                        {u.suspended ? (
                          <form action={setSuspended}>
                            <input type="hidden" name="id" value={id} />
                            <input type="hidden" name="suspend" value="0" />
                            <button className={btnOutline}>解除停權</button>
                          </form>
                        ) : (
                          <details className="relative">
                            <summary className={`${btnGhost} cursor-pointer list-none text-red-600 hover:bg-red-50`}>停權</summary>
                            <div className="absolute right-0 z-10 mt-1 w-56 rounded-xl border bg-white p-4 shadow-lg">
                              <p className="text-sm">停權後這個人就無法登入，確定嗎？</p>
                              <form action={setSuspended} className="mt-3">
                                <input type="hidden" name="id" value={id} />
                                <input type="hidden" name="suspend" value="1" />
                                <button className={`${btnDanger} w-full justify-center`}>確定停權</button>
                              </form>
                            </div>
                          </details>
                        )}
                        <details className="relative">
                          <summary className={`${btnGhost} cursor-pointer list-none text-red-600 hover:bg-red-50`}>刪除</summary>
                          <div className="absolute right-0 z-10 mt-1 w-64 rounded-xl border bg-white p-4 shadow-lg">
                            <p className="text-sm font-medium text-red-700">永久刪除這個帳號？</p>
                            <p className="mt-1 text-xs text-gray-500">他的所有作品、照片和相關檢舉會一起刪除，無法復原。若只是想擋住他，請用「停權」。</p>
                            <form action={deleteUser} className="mt-3">
                              <input type="hidden" name="id" value={id} />
                              <button className={`${btnDanger} w-full justify-center`}>確定刪除</button>
                            </form>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>

                  <details className="mt-3 text-sm" open={isPending && !!pf.realName}>
                    <summary className="cursor-pointer text-gray-500 hover:text-black">{pf.realName ? "查看申請資料" : "尚未填寫資料"}</summary>
                    {pf.realName && (
                      <dl className="mt-3 grid gap-x-6 gap-y-2 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
                        {([
                          ["真實姓名", pf.realName],
                          ["手機", pf.phone],
                          ["顯示名稱", pf.name],
                          ["所在縣市", pf.region],
                          ["所屬單位", pf.organization],
                          ["攝影年資", pf.experience],
                          ["擅長運動", pf.sports.map((x) => getSport(x)?.name).join("、")],
                          ["常用器材", pf.gear],
                          ["Instagram", pf.instagram && `@${pf.instagram}`],
                          ["Facebook", pf.facebook],
                          ["個人網站", pf.website],
                          ["同意條款", pf.agreedAt && new Date(pf.agreedAt).toLocaleDateString("zh-TW")],
                        ] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => (
                          <div key={k}><dt className="text-xs text-gray-500">{k}</dt><dd className="break-all">{v}</dd></div>
                        ))}
                        {pf.bio && <div className="sm:col-span-2"><dt className="text-xs text-gray-500">自我介紹</dt><dd className="whitespace-pre-wrap">{pf.bio}</dd></div>}
                      </dl>
                    )}
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function AdminUsersPage(props: PageProps<"/admin/users">) {
  return (
    <Suspense>
      <AdminUsersPageContent {...props} />
    </Suspense>
  );
}
