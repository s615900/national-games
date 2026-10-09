import Link from "next/link";
import type { Work } from "@/lib/data";
import { sports } from "@/lib/sports";

const field = "mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}{required && <span className="text-red-600"> *</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

// 新增與修改作品共用的表單；有帶 work 就是修改
export function WorkForm({ action, work, submitLabel }: { action: (fd: FormData) => Promise<void>; work?: Work; submitLabel: string }) {
  return (
    <form action={action} className="space-y-8 rounded-2xl border bg-white p-6 shadow-sm">
      {work && <input type="hidden" name="id" value={work.id} />}
      <section className="space-y-4">
        <h2 className="font-bold">基本資訊</h2>
        <Field label="作品標題" required><input name="title" required maxLength={50} defaultValue={work?.title} placeholder="例：最後一百公尺的衝刺" className={field} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="運動項目" required>
            <select name="sport" required defaultValue={work?.sport ?? ""} className={field}>
              <option value="" disabled>請選擇</option>
              {sports.map((s) => <option key={s.slug} value={s.slug}>{s.emoji} {s.name}</option>)}
            </select>
          </Field>
          <Field label="拍攝日期" required><input name="date" type="date" required defaultValue={work?.date} className={field} /></Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-bold">賽事資訊</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="賽事名稱"><input name="event" maxLength={50} defaultValue={work?.event} placeholder="例：115 年全國田徑錦標賽" className={field} /></Field>
          <Field label="拍攝地點"><input name="location" maxLength={50} defaultValue={work?.location} placeholder="例：高雄國家體育場" className={field} /></Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-bold">作品說明</h2>
        <Field label="拍攝故事、器材等" hint="選填，最多 500 字"><textarea name="description" maxLength={500} rows={5} defaultValue={work?.description} className={field} /></Field>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">作品照片</h2>
        <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          <span className="text-3xl">🖼️</span>
          <p className="mt-2 font-medium text-gray-700">照片上傳即將開放</p>
          <p className="mt-1">現在可以先送出作品資訊，之後再補照片。</p>
        </div>
      </section>

      <div className="flex items-center gap-3 border-t pt-6">
        <button className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800">{submitLabel}</button>
        <Link href="/dashboard" className="rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100">取消</Link>
      </div>
    </form>
  );
}
