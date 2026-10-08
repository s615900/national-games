import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getDb } from "@/lib/mongodb";
import { isRole, type Role } from "@/lib/roles";

// 管理員白名單：.env.local 的 ADMIN_EMAILS，用逗號分隔
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  callbacks: {
    // 登入時：第一次登入就建立使用者；白名單信箱自動成為管理員
    async signIn({ user, profile }) {
      const email = user.email?.toLowerCase();
      if (!email || profile?.email_verified === false) return false;
      const users = (await getDb()).collection("users");
      const isAdmin = adminEmails.includes(email);
      await users.updateOne(
        { email },
        {
          $set: { name: user.name ?? "", image: user.image ?? "", lastLoginAt: new Date(), ...(isAdmin && { role: "admin" }) },
          $setOnInsert: { createdAt: new Date(), ...(!isAdmin && { role: "photographer_pending" }), suspended: false },
        },
        { upsert: true }
      );
      const doc = await users.findOne({ email });
      return !doc?.suspended; // 被停權的人不能登入
    },
    // 每次都從資料庫讀最新身分，改權限後不用等對方重新登入
    async jwt({ token }) {
      if (token.email) {
        const doc = await (await getDb()).collection("users").findOne({ email: token.email.toLowerCase() });
        token.role = doc && !doc.suspended && isRole(doc.role) ? doc.role : undefined;
        token.uid = doc?._id.toString();
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as Role | undefined;
      session.user.id = token.uid as string;
      return session;
    },
  },
});
