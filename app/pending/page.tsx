import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { getProfile } from "@/lib/data";
import { requireRole } from "@/lib/guard";
import { hasRole } from "@/lib/roles";

async function PendingPageContent() {
  const session = await requireRole("photographer_pending");
  if (hasRole(session.user.role, "photographer")) redirect("/dashboard");
  const profile = await getProfile(session.user.id);
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">帳號審核中</h1>
        <p className="mt-4">
          {session.user.name}，你好！你的帳號已建立，正在等待管理員核准。請先填寫下方資料，管理員審核時會看到；
          <strong>核准後不用再填一次</strong>，之後可以在後台修改。
        </p>
      </div>
      <ProfileForm profile={profile} />
    </main>
  );
}

export default function PendingPage() {
  return (
    <Suspense>
      <PendingPageContent />
    </Suspense>
  );
}
