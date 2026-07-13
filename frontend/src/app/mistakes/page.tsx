export default function MistakesPage() {
  return (
    <div>
      {/* Header: same band as the other screens so navigation feels consistent */}
      <div className="bg-white border-b border-border px-5 sm:px-9 py-[18px]">
        <h1 className="font-serif text-[20px] font-bold tracking-[0.02em]">
          苦手問題
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center py-24 px-5 text-center">
        <span className="text-5xl mb-5" role="img" aria-label="">
          📖
        </span>
        <h2 className="font-serif text-[18px] font-bold text-navy mb-2">
          この画面は準備中です
        </h2>
        <p className="text-[14px] text-muted max-w-xs leading-relaxed">
          登録した問題の一覧と克服状況を、ここで確認できるようになります。
        </p>
      </div>
    </div>
  );
}
