// 運動項目是固定清單，不放資料庫
export type Sport = { slug: string; name: string; emoji: string; color: string };

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

export const getSport = (slug: string) => sports.find((s) => s.slug === slug);
