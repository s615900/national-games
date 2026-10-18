"use client";
import { useEffect } from "react";
import { recordView } from "@/app/works/view-action";

// 看不見的元件：作品頁打開時記一次點擊
export function ViewCounter({ workId }: { workId: string }) {
  useEffect(() => {
    recordView(workId).catch(() => {});
  }, [workId]);
  return null;
}
