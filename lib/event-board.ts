// 從「賽事看板」讀取公開賽事日期列表（資料庫各自獨立，只透過公開 API 溝通）
export const EVENT_BOARD_URL = "https://event-board-one.vercel.app";

export type BoardEvent = {
  id: string;
  name: string;
  sportName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  county: string;
  location: string;
  officialUrl: string;
  url: string;
};

// 每 10 分鐘更新一次；賽事看板連不上時回傳空陣列，不讓整個頁面壞掉
export async function listBoardEvents(): Promise<BoardEvent[]> {
  try {
    const res = await fetch(`${EVENT_BOARD_URL}/api/public/events`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    return (await res.json()) as BoardEvent[];
  } catch {
    return [];
  }
}
