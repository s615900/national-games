"use client";
import { useEffect, useRef, useState } from "react";
import { PHOTO_EXIF_EVENT } from "@/components/PhotoPicker";
import type { PhotoExif } from "@/lib/exif";
import { sports } from "@/lib/sports";

export type AssistEvent = { id: string; name: string; sportName: string; startDate: string; endDate: string; location: string; county: string };

// 放在作品表單裡：照片選好後，用 EXIF 的拍攝日期自動填「拍攝日期」，
// 再拿日期去比對賽事看板，找出當天的比賽，讓攝影師一鍵帶入賽事名稱／地點／運動項目
export function ExifAssist({ events, initialEventId }: { events: AssistEvent[]; initialEventId?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [exif, setExif] = useState<PhotoExif[]>([]);
  const [date, setDate] = useState("");
  const [sportSlug, setSportSlug] = useState("");
  const [eventId, setEventId] = useState(initialEventId ?? "");
  const applied = useRef(""); // 剛套用的賽事名稱；攝影師手動改掉名稱後，就不再綁定賽事

  const form = () => root.current?.closest("form") ?? null;
  const input = (name: string) => form()?.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;

  useEffect(() => {
    const f = root.current?.closest("form");
    if (!f) return;
    const dateEl = f.elements.namedItem("date") as HTMLInputElement | null;
    const sportEl = f.elements.namedItem("sport") as HTMLSelectElement | null;
    const eventEl = f.elements.namedItem("event") as HTMLInputElement | null;
    const onPhotos = (e: Event) => {
      const list = (e as CustomEvent<PhotoExif[]>).detail;
      setExif(list);
      const first = list.map((x) => x.takenAt).filter((x): x is string => !!x).sort()[0];
      // 只在「還沒填」或「是上次自動帶入的」才覆蓋，不蓋掉攝影師自己填的
      if (first && dateEl && (!dateEl.value || dateEl.dataset.auto === "1")) {
        dateEl.value = first.slice(0, 10);
        dateEl.dataset.auto = "1";
        setDate(dateEl.value);
      }
    };
    const onDate = () => { dateEl!.dataset.auto = ""; setDate(dateEl!.value); };
    const onEventName = () => { if (eventEl!.value !== applied.current) setEventId(""); };
    const onSport = () => setSportSlug(sportEl!.value);
    window.addEventListener(PHOTO_EXIF_EVENT, onPhotos);
    sportEl?.addEventListener("change", onSport);
    dateEl?.addEventListener("input", onDate);
    eventEl?.addEventListener("input", onEventName);
    setSportSlug(sportEl?.value ?? "");
    setDate(dateEl?.value ?? ""); // 修改作品時，一進來就依現有日期比對
    return () => {
      window.removeEventListener(PHOTO_EXIF_EVENT, onPhotos);
      sportEl?.removeEventListener("change", onSport);
      dateEl?.removeEventListener("input", onDate);
      eventEl?.removeEventListener("input", onEventName);
    };
  }, []);

  const sportName = sports.find((s) => s.slug === sportSlug)?.name;
  const matches = events.filter((e) => date && e.startDate <= date && date <= e.endDate);
  // 運動項目已選就只留同項目的；沒有同項目的就全部列出
  const sameSport = sportName ? matches.filter((e) => e.sportName.includes(sportName)) : matches;
  const shown = (sameSport.length ? sameSport : matches).filter((e) => e.id !== eventId).slice(0, 5);
  const current = events.find((e) => e.id === eventId);

  function apply(e: AssistEvent) {
    applied.current = e.name.slice(0, 50);
    const set = (name: string, v: string, onlyIfEmpty = false) => {
      const el = input(name);
      if (el && (!onlyIfEmpty || !el.value)) el.value = v;
    };
    set("event", e.name.slice(0, 50));
    set("location", e.location.slice(0, 50), true);
    const slug = sports.find((s) => e.sportName.includes(s.name))?.slug;
    if (slug) { set("sport", slug, true); setSportSlug(input("sport")?.value ?? ""); }
    setEventId(e.id);
  }

  const cameras = [...new Set(exif.map((x) => x.camera).filter(Boolean))];
  const lenses = [...new Set(exif.map((x) => x.lens).filter(Boolean))];
  const hasInfo = exif.some((x) => x.takenAt || x.camera);

  return (
    <div ref={root} className="space-y-2 text-sm">
      <input type="hidden" name="eventId" value={eventId} />
      {hasInfo && (
        <p className="rounded-lg bg-sky-50 px-3 py-2 text-sky-900">
          📷 已讀取照片資訊{date && <>：拍攝日期 <strong>{date}</strong>（已填入上方）</>}
          {cameras.length > 0 && <>・器材 {cameras.join("、")}{lenses.length > 0 && ` + ${lenses.join("、")}`}</>}
        </p>
      )}
      {exif.length > 0 && !hasInfo && <p className="rounded-lg bg-gray-50 px-3 py-2 text-gray-600">這些照片沒有內建拍攝資訊（可能被 LINE、社群軟體處理過），請自己填拍攝日期。</p>}
      {current && <p className="rounded-lg bg-green-50 px-3 py-2 text-green-800">🔗 已連結賽事看板：<strong>{current.name}</strong>，作品通過審核後會自動出現在這場賽事的作品頁。</p>}
      {shown.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
          <p className="font-medium text-orange-900">{date} 有這些比賽，是其中一場嗎？</p>
          <ul className="mt-2 space-y-1.5">
            {shown.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => apply(e)} className="rounded-md bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-orange-600">套用</button>
                <span>{e.name}</span>
                <span className="text-xs text-gray-500">{[e.sportName, e.county].filter(Boolean).join("・")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
