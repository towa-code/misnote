"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserResponse } from "@/generated";
import { authApi } from "@/lib/api";
import { clearToken } from "@/lib/auth-token";

export default function AccountPanel() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    authApi
      .getMeV1AuthMeGet()
      .then(setUser)
      .catch(() => setError("アカウント情報の取得に失敗しました。"));
  }, []);

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <div>
      <header className="bg-surface border-b border-border px-5 sm:px-9 py-[18px]">
        <h1 className="font-serif text-[20px] font-bold tracking-[0.02em] text-text">
          アカウント
        </h1>
      </header>

      <div className="p-5 sm:p-9 max-w-[520px]">
        {error && (
          <p className="mb-5 bg-amber-lt border border-amber text-amber text-[13px] rounded-md px-3 py-2.5">
            {error}
          </p>
        )}

        <dl className="bg-surface border border-border rounded-lg divide-y divide-border">
          <div className="px-5 py-4">
            <dt className="text-[11px] font-bold text-muted tracking-[0.07em] uppercase mb-1">
              お名前
            </dt>
            <dd className="text-[15px] text-text">{user?.name ?? "—"}</dd>
          </div>
          <div className="px-5 py-4">
            <dt className="text-[11px] font-bold text-muted tracking-[0.07em] uppercase mb-1">
              メールアドレス
            </dt>
            <dd className="text-[15px] text-text break-all">{user?.email ?? "—"}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 px-4 py-2.5 rounded-md border border-border bg-surface text-[13px] font-bold text-muted transition-colors duration-150 hover:bg-navy-lt hover:border-[#CBD5E1] hover:text-navy"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
