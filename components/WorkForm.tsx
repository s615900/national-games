import Link from "next/link";
import { ExifAssist, type AssistEvent } from "@/components/ExifAssist";
import { PhotoPicker } from "@/components/PhotoPicker";
import type { Work } from "@/lib/data";
import { PHOTO_LIMITS, photoUrl } from "@/lib/photos";
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
export function WorkForm({ action, work, submitLabel, events = [] }: { action: (fd: FormData) => Promise<void>; work?: Work; submitLabel: string; events?: AssistEvent[] }) {
  const existing = work?.photos ?? [];
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
        <h2 className="font-bold">作品照片 <span className="text-xs font-normal text-gray-500">最多 {PHOTO_LIMITS.perWork} 張，第一張會當封面</span></h2>
        {existing.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-gray-600">目前的照片：選「封面」可更換封面，勾「刪除」會在儲存時移除。</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {existing.map((p, i) => (
                <li key={p.id} className="overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 已經是縮圖 */}
                  <img src={photoUrl(p.id)} alt={`照片 ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs">
                    <label className="flex items-center gap-1"><input type="radio" name="cover" value={p.id} defaultChecked={i === 0} />封面</label>
                    <label className="flex items-center gap-1 text-red-600"><input type="checkbox" name="removePhoto" value={p.id} />刪除</label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <PhotoPicker max={Math.max(0, PHOTO_LIMITS.perWork - existing.length)} />
        <ExifAssist events={events} initialEventId={work?.eventId} />
      </section>

      <div className="flex items-center gap-3 border-t pt-6">
        <button className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800">{submitLabel}</button>
        <Link href="/dashboard" className="rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100">取消</Link>
      </div>
    </form>
  );
}
