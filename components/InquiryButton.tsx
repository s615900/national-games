"use client";
import { useActionState } from "react";
import { sendInquiry, type InquiryState } from "@/app/works/inquiry-action";
import { INQUIRY_MESSAGE_MAX, INQUIRY_PURPOSES } from "@/lib/inquiries";
import { btnPrimary } from "@/lib/ui";

const field = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10";

export function InquiryButton({ workId, photographerName }: { workId: string; photographerName: string }) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(sendInquiry, null);

  return (
    <details className="max-w-md">
      <summary className={`${btnPrimary} cursor-pointer list-none`}>📩 洽詢原圖</summary>
      <div className="mt-2 rounded-xl border bg-white p-4 shadow-sm">
        {state?.ok ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">✓ {state.message}</p>
        ) : (
          <form action={action} className="space-y-3">
            <p className="text-sm text-gray-600">留言給 {photographerName}，索取這件作品的高解析原圖。你的聯絡方式只有攝影師看得到。</p>
            <input type="hidden" name="workId" value={workId} />
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            <label className="block text-sm font-medium">你的稱呼 <span className="text-red-600">*</span>
              <input name="name" required maxLength={30} className={field} />
            </label>
            <label className="block text-sm font-medium">Email 或 LINE／電話 <span className="text-red-600">*</span>
              <input name="contact" required maxLength={100} className={field} />
            </label>
            <label className="block text-sm font-medium">用途 <span className="text-red-600">*</span>
              <select name="purpose" required defaultValue="" className={field}>
                <option value="" disabled>請選擇…</option>
                {INQUIRY_PURPOSES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">留言 <span className="text-red-600">*</span>
              <textarea name="message" required rows={4} maxLength={INQUIRY_MESSAGE_MAX} placeholder="例如：我是 3 號選手的家長，想要第二張照片的原圖" className={field} />
            </label>
            {state && !state.ok && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}
            <button disabled={pending} className={`${btnPrimary} disabled:opacity-60`}>{pending ? "送出中…" : "送出洽詢"}</button>
            <p className="text-xs text-gray-500">不需要登入。原圖是否提供、是否收費，由攝影師決定。</p>
          </form>
        )}
      </div>
    </details>
  );
}
