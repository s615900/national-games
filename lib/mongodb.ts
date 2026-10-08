import { MongoClient } from "mongodb";

// 開發模式下重複使用同一條連線，避免熱更新時一直開新連線
const globalForMongo = globalThis as unknown as { _mongo?: Promise<MongoClient> };

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("缺少環境變數 MONGODB_URI（請看 .env.local）");
  globalForMongo._mongo ??= new MongoClient(uri).connect();
  return (await globalForMongo._mongo).db(process.env.MONGODB_DB ?? "national_games");
}
