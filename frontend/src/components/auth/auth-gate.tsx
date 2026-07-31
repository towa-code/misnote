"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { getToken } from "@/lib/auth-token";

// 認証なしで見られるページ
const PUBLIC_PATHS = ["/login", "/signup"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // localStorage はサーバー側で読めないので、判定は初回描画のあとまで保留する
  // （ここを省くと hydration mismatch になる）
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    // setState はここでは直接呼ばない（react-hooks/set-state-in-effect 対策）。
    // 既存コード（register-form.tsx など）に倣い、Promise 経由の非同期コールバックにする。
    Promise.resolve().then(() => {
      const hasToken = getToken() !== null;
      setAuthed(hasToken);
      setChecked(true);
      if (!hasToken && !isPublic) {
        router.replace("/login");
      }
    });
  }, [isPublic, pathname, router]);

  if (isPublic) return <>{children}</>;
  if (!checked || !authed) return null;
  return <AppShell>{children}</AppShell>;
}
