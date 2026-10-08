import { Suspense } from "react";
import { requireRole } from "@/lib/guard";

async function PendingPageContent() {
  const session = await requireRole("photographer_pending");
  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold">帳號審核中</h1>
      <p className="mt-4">
        {session.user.name}，你好！你的帳號已建立，正在等待管理員核准。核准後就可以上傳作品了。
      </p>
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
