"use client";

import { useState } from "react";

// 手機版：右上角漢堡按鈕，點開往下展開選單；電腦版維持橫向排列
export function NavMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={open ? "關閉選單" : "開啟選單"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 sm:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <nav
        onClick={() => setOpen(false)}
        className={`text-sm sm:flex sm:items-center sm:gap-6 ${
          open
            ? "max-sm:absolute max-sm:inset-x-0 max-sm:top-full max-sm:flex max-sm:flex-col max-sm:gap-1 max-sm:border-b max-sm:bg-white max-sm:px-4 max-sm:py-3 max-sm:shadow-md max-sm:[&>a]:rounded-lg max-sm:[&>a]:px-3 max-sm:[&>a]:py-3 max-sm:[&>a]:text-base"
            : "hidden"
        }`}
      >
        {children}
      </nav>
    </>
  );
}
