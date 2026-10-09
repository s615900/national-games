import { ObjectId } from "mongodb";
import { connection } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { hasRole } from "@/lib/roles";

// 作品照片：作品審核通過就公開；還沒通過的，只有本人和審核員以上看得到
export async function GET(req: Request, ctx: RouteContext<"/api/photo/[id]">) {
  await connection();
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return new Response("Not found", { status: 404 });
  const size = new URL(req.url).searchParams.get("s") === "full" ? "full" : "thumb";
  const db = await getDb();
  const photo = await db.collection("photos").findOne({ _id: new ObjectId(id) }, { projection: { [size]: 1, workId: 1, ownerId: 1 } });
  if (!photo?.[size]) return new Response("Not found", { status: 404 });

  const work = ObjectId.isValid(photo.workId) ? await db.collection("works").findOne({ _id: new ObjectId(photo.workId) }, { projection: { status: 1 } }) : null;
  if (!work) return new Response("Not found", { status: 404 });
  const isPublic = work.status === "approved";
  if (!isPublic) {
    const session = await auth();
    if (!session?.user || (session.user.id !== photo.ownerId && !hasRole(session.user.role, "reviewer"))) return new Response("Not found", { status: 404 });
  }
  const buf: Buffer = photo[size].buffer ? Buffer.from(photo[size].buffer) : Buffer.from(photo[size]);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/webp",
      // 公開的快取 1 小時（作品被下架後最久 1 小時內舊快取會消失）；未公開的不快取
      "Cache-Control": isPublic ? "public, max-age=3600" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
