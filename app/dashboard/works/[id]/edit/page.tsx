import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { WorkForm } from "@/components/WorkForm";
import { getOwnWork } from "@/lib/data";
import { requireRole } from "@/lib/guard";
import { WORK_STATUS } from "@/lib/ui";
import { updateWork } from "../../../actions";

async function EditWorkContent({ params, searchParams }: PageProps<"/dashboard/works/[id]/edit">) {
  const session = await requireRole("photographer_pending");
  if (session.user.role === "photographer_pending") redirect("/pending");
  const { id } = await params;
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const work = await getOwnWork(id, session.user.id);
  if (!work) notFound();
  const st = WORK_STATUS[work.status] ?? WORK_STATUS.pending;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">← 回後台</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">修改作品</h1>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${st.badge}`}>{st.label}</span>
      </div>

      {work.status === "rejected" && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span className="font-medium">這件作品被退回了。</span>{work.rejectReason && <>原因：{work.rejectReason}。</>}依照意見修改後按「重新送審」即可。
        </p>
      )}
      {work.status === "approved" && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <span className="font-medium">這件作品已經公開。</span>如果你修改並儲存，作品會回到「審核中」，<strong>審核通過前會暫時從公開頁面下架</strong>。
        </p>
      )}
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 max-w-3xl">
        <WorkForm action={updateWork} work={work} submitLabel={work.status === "pending" ? "儲存修改" : "儲存並重新送審"} />
      </div>
    </main>
  );
}

export default function EditWorkPage(props: PageProps<"/dashboard/works/[id]/edit">) {
  return (
    <Suspense>
      <EditWorkContent {...props} />
    </Suspense>
  );
}
