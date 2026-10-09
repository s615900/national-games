import { ObjectId } from "mongodb";
import { connection } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { hasRole } from "@/lib/roles";

// 大頭貼：已核准的攝影師是公開的；還在申請中的，只有本人和審核員以上看得到
export async function GET(_req: Request, ctx: RouteContext<"/api/avatar/[id]">) {
  await connection();
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return new Response("Not found", { status: 404 });
  const doc = await (await getDb()).collection("users").findOne({ _id: new ObjectId(id) }, { projection: { avatar: 1, role: 1, suspended: 1 } });
  if (!doc?.avatar) return new Response("Not found", { status: 404 });

  const isPublic = !doc.suspended && ["photographer", "reviewer", "admin"].includes(doc.role);
  if (!isPublic) {
    const session = await auth();
    if (!session?.user || (session.user.id !== id && !hasRole(session.user.role, "reviewer"))) return new Response("Not found", { status: 404 });
  }
  const buf: Buffer = doc.avatar.buffer ? Buffer.from(doc.avatar.buffer) : Buffer.from(doc.avatar);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/webp",
      // 網址有版本號，公開的可以長期快取；私人的不快取
      "Cache-Control": isPublic ? "public, max-age=31536000, immutable" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
