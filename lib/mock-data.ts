// 前台先用假資料；之後接上 MongoDB 時，只要改這個檔案的讀取方式
export type Sport = { slug: string; name: string; emoji: string; color: string };
export type Photographer = { id: string; name: string; region: string; bio: string; sports: string[]; instagram?: string };
export type Work = { id: string; title: string; photographerId: string; sport: string; event: string; date: string; location: string; description: string };

export const sports: Sport[] = [
  { slug: "track", name: "田徑", emoji: "🏃", color: "from-orange-400 to-red-500" },
  { slug: "basketball", name: "籃球", emoji: "🏀", color: "from-amber-400 to-orange-600" },
  { slug: "baseball", name: "棒球", emoji: "⚾", color: "from-sky-400 to-blue-600" },
  { slug: "swimming", name: "游泳", emoji: "🏊", color: "from-cyan-400 to-blue-500" },
  { slug: "volleyball", name: "排球", emoji: "🏐", color: "from-yellow-300 to-amber-500" },
  { slug: "badminton", name: "羽球", emoji: "🏸", color: "from-emerald-400 to-teal-600" },
  { slug: "football", name: "足球", emoji: "⚽", color: "from-green-400 to-emerald-700" },
  { slug: "cycling", name: "自行車", emoji: "🚴", color: "from-violet-400 to-purple-600" },
];

export const photographers: Photographer[] = [
  { id: "p1", name: "林冠宇", region: "台北市", bio: "專注田徑與路跑十年，喜歡捕捉衝線前一刻的表情。", sports: ["track", "cycling"], instagram: "demo_lin" },
  { id: "p2", name: "陳怡萱", region: "新北市", bio: "籃球與排球場邊攝影，擅長高速連拍與動態瞬間。", sports: ["basketball", "volleyball"] },
  { id: "p3", name: "黃柏翰", region: "台中市", bio: "棒球迷出身，跑遍全台球場，記錄每一場比賽的故事。", sports: ["baseball"], instagram: "demo_huang" },
  { id: "p4", name: "張雅婷", region: "高雄市", bio: "水中與水面攝影，專拍游泳與水上運動。", sports: ["swimming"] },
  { id: "p5", name: "吳承恩", region: "台南市", bio: "羽球與足球攝影，喜歡用長焦鏡頭拍特寫。", sports: ["badminton", "football"] },
  { id: "p6", name: "李欣怡", region: "桃園市", bio: "校園運動會到全國賽事，都有我的身影。", sports: ["track", "basketball", "volleyball"] },
];

const titles = ["最後一百公尺", "起跑的瞬間", "空中對決", "全力衝刺", "勝利的擁抱", "專注的眼神", "水花四濺", "完美扣殺", "投出關鍵一球", "雨中奮戰", "終點線前", "團隊慶祝"];
const events = ["全國運動會", "全中運", "大專運動會", "城市路跑賽", "縣市聯賽", "全國中正盃"];
const places = ["台北田徑場", "新莊體育館", "洲際棒球場", "高雄國家體育場", "台南市立體育場", "桃園體育館"];

export const works: Work[] = Array.from({ length: 24 }, (_, i) => {
  const p = photographers[i % photographers.length];
  return {
    id: `w${i + 1}`,
    title: titles[i % titles.length],
    photographerId: p.id,
    sport: p.sports[i % p.sports.length],
    event: events[i % events.length],
    date: `2026-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
    location: places[i % places.length],
    description: "這是示範用的作品說明。正式上線後，這裡會顯示攝影師填寫的拍攝故事與器材資訊。",
  };
});

export const getSport = (slug: string) => sports.find((s) => s.slug === slug);
export const getPhotographer = (id: string) => photographers.find((p) => p.id === id);
export const getWork = (id: string) => works.find((w) => w.id === id);
