"use client";
import { useActionState } from "react";
import { reportWork, type ReportState } from "@/app/works/report-action";
import { REPORT_DETAIL_MAX, REPORT_REASONS } from "@/lib/reports";
import { btnDanger, btnOutline } from "@/lib/ui";

const field = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10";

export function ReportButton({ workId }: { workId: string }) {
  const [state, action, pending] = useActionState<ReportState, FormData>(reportWork, null);

  return (
    <details className="mt-6 max-w-md">
      <summary className={`${btnOutline} cursor-pointer list-none`}>⚑ 檢舉此作品</summary>
      <div className="mt-2 rounded-xl border bg-white p-4 shadow-sm">
        {state?.ok ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">✓ {state.message}</p>
        ) : (
          <form action={action} className="space-y-3">
            <input type="hidden" name="workId" value={workId} />
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            <label className="block text-sm font-medium">檢舉原因 <span className="text-red-600">*</span>
              <select name="reason" required defaultValue="" className={field}>
                <option value="" disabled>請選擇…</option>
                {REPORT_REASONS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">補充說明
              <textarea name="detail" rows={3} maxLength={REPORT_DETAIL_MAX} placeholder="例如：這是我拍的照片，原始連結是…" className={field} />
            </label>
            <label className="block text-sm font-medium">你的聯絡信箱（選填）
              <input name="contact" type="email" maxLength={100} placeholder="審核員需要詢問時才會聯絡你" className={field} />
            </label>
            {state && !state.ok && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}
            <button disabled={pending} className={`${btnDanger} disabled:opacity-60`}>{pending ? "送出中…" : "送出檢舉"}</button>
            <p className="text-xs text-gray-500">不需要登入。惡意重複檢舉會被限制。</p>
          </form>
        )}
      </div>
    </details>
  );
}
