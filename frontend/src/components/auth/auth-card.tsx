// ログイン／新規登録で共通の枠。ロゴ付きの中央カード。
export default function AuthCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <div className="font-serif text-[28px] font-bold tracking-[0.05em] text-ink mb-7">
        mis<span className="text-primary">note</span>
      </div>
      <div className="w-full max-w-[380px] bg-surface border border-border rounded-lg p-7">
        <h1 className="font-serif text-[19px] font-bold tracking-[0.02em] text-text mb-6">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
