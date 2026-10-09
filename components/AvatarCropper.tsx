"use client";
import { useRef, useState } from "react";
import { saveAvatar } from "@/app/dashboard/actions";

const VIEW = 240; // 預覽框邊長（px）
const OUT = 512; // 輸出圖片邊長（px），伺服器還會再縮成 256

type Pos = { x: number; y: number };

// 選圖 → 拖曳調位置、滑桿調大小 → 在瀏覽器裡先裁成正方形再上傳（上傳量也變小）
export function AvatarCropper({ from, hasAvatar }: { from: "/pending" | "/dashboard/profile"; hasAvatar: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState<Pos>({ x: 0, y: 0 }); // 圖片中心相對預覽框中心的位移
  const [error, setError] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<HTMLInputElement>(null); // 真正送出的檔案（裁好的）
  const pickRef = useRef<HTMLInputElement>(null); // 使用者選圖用
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  const scale = size ? (VIEW / Math.min(size.w, size.h)) * zoom : 1;
  const dw = size ? size.w * scale : 0;
  const dh = size ? size.h * scale : 0;
  const clamp = (p: Pos, z = zoom): Pos => {
    if (!size) return p;
    const s = (VIEW / Math.min(size.w, size.h)) * z;
    const mx = Math.max(0, (size.w * s - VIEW) / 2);
    const my = Math.max(0, (size.h * s - VIEW) / 2);
    return { x: Math.min(mx, Math.max(-mx, p.x)), y: Math.min(my, Math.max(-my, p.y)) };
  };

  function reset() {
    if (src) URL.revokeObjectURL(src);
    setSrc(null); setSize(null); setZoom(1); setOff({ x: 0, y: 0 }); setError("");
    if (pickRef.current) pickRef.current.value = "";
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setError("請選 JPG、PNG 或 WebP 圖片"); e.target.value = ""; return; }
    if (file.size > 20 * 1024 * 1024) { setError("圖片太大，請選 20MB 以下的檔案"); e.target.value = ""; return; }
    if (src) URL.revokeObjectURL(src);
    setError(""); setZoom(1); setOff({ x: 0, y: 0 }); setSize(null);
    setSrc(URL.createObjectURL(file));
  }

  function onZoom(z: number) {
    setZoom(z);
    setOff((o) => clamp(o, z));
  }

  // 送出前：把預覽框看到的範圍畫成 512×512，塞進要上傳的檔案欄位
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const img = imgRef.current;
    if (!img || !size || !fileRef.current) { e.preventDefault(); return; }
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) { e.preventDefault(); setError("這個瀏覽器不支援圖片處理"); return; }
    const sSize = VIEW / scale;
    const sx = (dw - VIEW) / 2 / scale - off.x / scale;
    const sy = (dh - VIEW) / 2 / scale - off.y / scale;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUT, OUT);
    const bin = atob(canvas.toDataURL("image/jpeg", 0.9).split(",")[1]);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const dt = new DataTransfer();
    dt.items.add(new File([bytes], "avatar.jpg", { type: "image/jpeg" }));
    fileRef.current.files = dt.files;
  }

  return (
    <form action={saveAvatar} onSubmit={onSubmit} className="mt-3">
      <input type="hidden" name="from" value={from} />
      <input ref={fileRef} type="file" name="avatar" className="hidden" tabIndex={-1} aria-hidden />

      {!src ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            {hasAvatar ? "更換大頭貼" : "選擇圖片"}
            <input ref={pickRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} className="sr-only" />
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">拖曳圖片調整位置，用滑桿調整大小。圓形範圍內就是大頭貼會顯示的部分。</p>
          <div
            className="relative touch-none select-none overflow-hidden rounded-xl bg-gray-100"
            style={{ width: VIEW, height: VIEW, cursor: size ? "grab" : "wait" }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { px: e.clientX, py: e.clientY, ox: off.x, oy: off.y }; }}
            onPointerMove={(e) => { const d = drag.current; if (d) setOff(clamp({ x: d.ox + e.clientX - d.px, y: d.oy + e.clientY - d.py })); }}
            onPointerUp={() => { drag.current = null; }}
            onPointerCancel={() => { drag.current = null; }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- 本機預覽用的暫時網址 */}
            <img
              ref={imgRef}
              src={src}
              alt="預覽"
              draggable={false}
              onLoad={(e) => setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              className="pointer-events-none absolute max-w-none"
              style={size ? { width: dw, height: dh, left: (VIEW - dw) / 2 + off.x, top: (VIEW - dh) / 2 + off.y } : { visibility: "hidden" }}
            />
            {/* 圓形取景框：圓外變暗 */}
            <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white" style={{ boxShadow: "0 0 0 999px rgba(0,0,0,.45)" }} />
          </div>
          <div className="flex items-center gap-3" style={{ width: VIEW }}>
            <span className="text-xs text-gray-500">小</span>
            <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => onZoom(Number(e.target.value))} aria-label="縮放" className="flex-1 accent-black" />
            <span className="text-xs text-gray-500">大</span>
          </div>
          <div className="flex gap-2">
            <button disabled={!size} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">儲存大頭貼</button>
            <button type="button" onClick={reset} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">取消</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
