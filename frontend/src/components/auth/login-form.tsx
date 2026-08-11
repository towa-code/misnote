"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/auth-card";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth-token";
import { inputBase, labelBase } from "@/lib/form-styles";
import { ResponseError } from "@/generated";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const token = await authApi.loginV1AuthLoginPost({
        userLogin: { email, password },
      });
      setToken(token.accessToken);
      router.replace("/");
    } catch (e) {
      if (e instanceof ResponseError && e.response.status === 401) {
        setError("メールアドレスまたはパスワードが正しくありません。");
      } else {
        setError("通信に失敗しました。時間をおいて再度お試しください。");
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="ログイン">
      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        {error && (
          <p
            role="alert"
            className="bg-red-lt border border-red text-red text-[13px] rounded-md px-3 py-2.5"
          >
            {error}
          </p>
        )}
        <div>
          <label className={labelBase} htmlFor="email">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            className={inputBase}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className={labelBase} htmlFor="password">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            className={inputBase}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary py-2.5 text-[14px] font-bold text-white transition-colors duration-150 hover:bg-primary-dk disabled:opacity-50"
        >
          {submitting ? "ログイン中…" : "ログイン"}
        </button>
        <p className="text-center text-[13px] text-muted">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="font-bold text-primary hover:underline">
            新規登録
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
