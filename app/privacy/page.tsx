export const metadata = { title: "隱私權政策｜National Games" };

// 草稿：正式上線前請由站方確認內容，並填入聯絡方式
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 leading-relaxed">
      <h1 className="text-2xl font-bold">隱私權政策</h1>
      <p className="text-sm text-gray-500">最後更新：2026 年 10 月</p>

      <section>
        <h2 className="text-lg font-bold">1. 我們蒐集哪些資料</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Google 登入資料</strong>：姓名、Email、頭像（由 Google 提供）。</li>
          <li><strong>註冊時你填寫的資料</strong>：真實姓名、手機號碼、顯示名稱、所在縣市、所屬單位、攝影年資、常用器材、自我介紹、擅長運動、社群與網站連結。</li>
          <li><strong>你投稿的作品資料</strong>：標題、賽事、日期、地點、說明。</li>
          <li><strong>使用紀錄</strong>：最近登入時間、同意條款的時間。</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-bold">2. 哪些會公開、哪些不會</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>公開</strong>：顯示名稱、所在縣市、所屬單位、攝影年資、常用器材、自我介紹、擅長運動、社群與網站連結，以及通過審核的作品。</li>
          <li><strong>不公開，只有你和管理員看得到</strong>：真實姓名、手機號碼、Email。</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-bold">3. 如何使用</h2>
        <p className="mt-2">資料只用於帳號審核、作品展示，以及必要時聯絡你。我們不會出售或提供你的個人資料給第三方，法律要求者除外。</p>
      </section>
      <section>
        <h2 className="text-lg font-bold">4. 保存與刪除</h2>
        <p className="mt-2">資料保存在雲端資料庫，只有管理員能存取不公開欄位。你可以隨時在後台修改資料、刪除作品；若要刪除整個帳號，請來信告知，我們會一併刪除你的個人資料與作品。</p>
      </section>
      <section>
        <h2 className="text-lg font-bold">5. 聯絡我們</h2>
        <p className="mt-2">有任何隱私問題請來信：【待填：聯絡信箱】。</p>
      </section>
      <p className="text-sm text-gray-500">作品授權方式請見<a href="/terms" className="underline">服務條款</a>。</p>
    </main>
  );
}
