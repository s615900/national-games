import { Suspense } from "react";
import { requireRole } from "@/lib/guard";

async function ReviewPageContent() {
  await requireRole("reviewer");
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">審核後台</h1>
      <p className="mt-4 text-gray-500">待審核作品清單將在下一階段加入。</p>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewPageContent />
    </Suspense>
  );
}
