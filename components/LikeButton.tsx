"use client";
import { useState, useTransition } from "react";
import { toggleLike } from "@/app/works/like-action";

export function LikeButton({ workId, initialLiked, initialCount }: { workId: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function click() {
    setError("");
    // 先直接更新畫面，失敗再還原
    const prev = { liked, count };
    setLiked(!liked);
    setCount(Math.max(0, count + (liked ? -1 : 1)));
    start(async () => {
      const r = await toggleLike(workId);
      if (r.ok) { setLiked(r.liked); setCount(r.count); }
      else { setLiked(prev.liked); setCount(prev.count); setError(r.message ?? "失敗了，請再試一次"); }
    });
  }

  return (
    <span className="inline-flex flex-col">
      <button type="button" onClick={click} disabled={pending} aria-pressed={liked} className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition disabled:opacity-70 ${liked ? "border-red-200 bg-red-50 text-red-600" : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"}`}>
        <span aria-hidden>{liked ? "♥" : "♡"}</span>{liked ? "已按讚" : "按讚"}<span className="tabular-nums text-gray-500">{count}</span>
      </button>
      {error && <span role="alert" className="mt-1 text-xs text-red-600">{error}</span>}
    </span>
  );
}
