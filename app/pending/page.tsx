import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AvatarEditor } from "@/components/Avatar";
import { ProfileForm, ProfileNotice } from "@/components/ProfileForm";
import { getProfile } from "@/lib/data";
import { requireRole } from "@/lib/guard";
import { hasRole } from "@/lib/roles";

async function PendingPageContent({ searchParams }: PageProps<"/pending">) {
  const sp = await searchParams;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const session = await requireRole("photographer_pending");
  if (hasRole(session.user.role, "photographer")) redirect("/dashboard");
  const profile = await getProfile(session.user.id);
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">帳號審核中</h1>
        <p className="mt-4">
          {session.user.name}，你好！你的帳號已建立，正在等待管理員核准。請先完整填寫下方資料，管理員會依這些資料審核；
          <strong>核准後不用再填一次</strong>，之後可以在後台修改。
        </p>
      </div>
      <ProfileNotice saved={str(sp.saved)} error={str(sp.error)} />
      <AvatarEditor name={profile?.name || session.user.name || ""} src={profile?.avatarUrl} from="/pending" />
      <ProfileForm profile={profile} from="/pending" email={session.user.email} />
    </main>
  );
}

export default function PendingPage(props: PageProps<"/pending">) {
  return (
    <Suspense>
      <PendingPageContent {...props} />
    </Suspense>
  );
}
