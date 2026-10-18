"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export type Slide = { id: string; title: string; photographer: string; event: string; src: string };

// 首頁輪播：5 秒換一張，滑鼠移上去暫停；使用者設定「減少動態效果」時不自動播放
export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  useEffect(() => {
    if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [paused, n]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-100" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} role="region" aria-roledescription="輪播" aria-label="熱門作品">
      <div className="relative aspect-[4/3] sm:aspect-[16/8]">
        {slides.map((s, k) => (
          <Link key={s.id} href={`/works/${s.id}`} aria-hidden={k !== i} tabIndex={k === i ? 0 : -1} className={`absolute inset-0 transition-opacity duration-700 ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 已處理過的圖片 */}
            <img src={s.src} alt={s.title} loading={k === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16 text-white sm:p-8">
              <p className="text-xl font-bold sm:text-2xl">{s.title}</p>
              <p className="mt-1 text-sm text-white/80">{[s.photographer, s.event].filter(Boolean).join("・")}</p>
            </div>
          </Link>
        ))}
      </div>
      {n > 1 && (
        <>
          <button type="button" aria-label="上一張" onClick={() => setI((i - 1 + n) % n)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg hover:bg-white">‹</button>
          <button type="button" aria-label="下一張" onClick={() => setI((i + 1) % n)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg hover:bg-white">›</button>
          <div className="absolute bottom-3 right-4 flex gap-1.5 sm:bottom-5 sm:right-8">
            {slides.map((s, k) => (
              <button key={s.id} type="button" aria-label={`第 ${k + 1} 張`} aria-current={k === i} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
