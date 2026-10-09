import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AvatarEditor } from "@/components/Avatar";
import { ProfileForm, ProfileNotice } from "@/components/ProfileForm";
import { getProfile } from "@/lib/data";
import { requireRole } from "@/lib/guard";

async function ProfilePageContent({ searchParams }: PageProps<"/dashboard/profile">) {
  const session = await requireRole("photographer_pending");
  if (session.user.role === "photographer_pending") redirect("/pending"); // 還沒核准的人在申請頁填
  const sp = await searchParams;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const profile = await getProfile(session.user.id);

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">← 回後台</Link>
        <h1 className="mt-2 text-2xl font-bold">編輯個人資料</h1>
      </div>
      <ProfileNotice saved={str(sp.saved)} error={str(sp.error)} />
      <AvatarEditor name={profile?.name || session.user.name || ""} src={profile?.avatarUrl} from="/dashboard/profile" />
      <ProfileForm profile={profile} from="/dashboard/profile" email={session.user.email} />
    </main>
  );
}

export default function ProfilePage(props: PageProps<"/dashboard/profile">) {
  return (
    <Suspense>
      <ProfilePageContent {...props} />
    </Suspense>
  );
}
