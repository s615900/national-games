export const metadata = { title: "服務條款與作品授權｜National Games" };

// 草稿：正式上線前請由站方確認內容，並填入聯絡方式
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 leading-relaxed">
      <h1 className="text-2xl font-bold">服務條款與作品授權</h1>
      <p className="text-sm text-gray-500">最後更新：2026 年 10 月</p>

      <section>
        <h2 className="text-lg font-bold">1. 服務內容</h2>
        <p className="mt-2">本站提供運動攝影師展示作品的平台。訪客可免費瀏覽已通過審核的作品；攝影師需註冊並經管理員核准後，才能投稿作品。</p>
      </section>
      <section>
        <h2 className="text-lg font-bold">2. 帳號與審核</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>請使用本人的 Google 帳號登入，並提供真實、正確的資料。</li>
          <li>新帳號需經管理員核准；資料不實或違反本條款者，站方得拒絕核准、退回作品或停權。</li>
          <li>每件作品送出後需經審核，通過才會公開；被退回的作品會附上原因。</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-bold">3. 作品著作權與授權</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>作品著作權仍屬於攝影師本人，本站不會取得所有權。</li>
          <li>投稿即表示你同意授權本站，在通過審核後於本站網頁展示該作品及你的公開資料。</li>
          <li>你保證投稿的作品是自己拍攝，或已取得合法授權，且沒有侵害他人的著作權、肖像權或隱私權。</li>
          <li>你可以隨時在後台刪除自己的作品，刪除後即不再公開展示。</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-bold">4. 禁止事項</h2>
        <p className="mt-2">不得上傳違法、侵權、色情、暴力、歧視或與運動攝影無關的內容；不得冒用他人身分；不得干擾網站運作。</p>
      </section>
      <section>
        <h2 className="text-lg font-bold">5. 條款修改與聯絡</h2>
        <p className="mt-2">本條款修改時會公告於本頁。有任何問題請來信：weite.wu@qsprinttw.com。</p>
      </section>
      <p className="text-sm text-gray-500">個人資料的處理方式請見<a href="/privacy" className="underline">隱私權政策</a>。</p>
    </main>
  );
}
