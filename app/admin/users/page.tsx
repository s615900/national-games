import { Suspense } from "react";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/mongodb";
import { ROLES } from "@/lib/roles";
import { getSport } from "@/lib/sports";
import { setRole, setSuspended } from "./actions";

const ROLE_LABEL: Record<string, string> = {
  photographer_pending: "待核准攝影師",
  photographer: "攝影師",
  reviewer: "審核員",
  admin: "管理員",
};

async function AdminUsersPageContent() {
  const session = await requireRole("admin");
  const users = await (await getDb()).collection("users").find().sort({ createdAt: -1 }).toArray();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">帳號管理</h1>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">姓名</th><th className="p-2">信箱</th><th className="p-2">申請資料</th><th className="p-2">身分</th><th className="p-2">狀態</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const id = u._id.toString();
            const isMe = id === session.user.id;
            return (
              <tr key={id} className="border-b">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 text-xs text-gray-600">
                  {u.region || u.bio || u.instagram || u.sports?.length ? (
                    <>
                      <p>{[u.region, (u.sports ?? []).map((x: string) => getSport(x)?.name).join("、")].filter(Boolean).join("・")}</p>
                      {u.instagram && <p>IG：@{u.instagram}</p>}
                      {u.bio && <p className="mt-1 max-w-xs">{u.bio}</p>}
                    </>
                  ) : "（未填）"}
                </td>
                <td className="p-2">
                  {isMe ? ROLE_LABEL[u.role] : (
                    <form action={setRole} className="flex gap-2">
                      <input type="hidden" name="id" value={id} />
                      <select name="role" defaultValue={u.role} className="rounded border p-1">
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                      <button className="rounded bg-black px-2 text-white">儲存</button>
                    </form>
                  )}
                </td>
                <td className="p-2">
                  {isMe ? "—" : (
                    <form action={setSuspended}>
                      <input type="hidden" name="id" value={id} />
                      <input type="hidden" name="suspend" value={u.suspended ? "0" : "1"} />
                      <button className="underline">{u.suspended ? "已停權（點此解除）" : "停權"}</button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense>
      <AdminUsersPageContent />
    </Suspense>
  );
}
