"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/auth-card";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth-token";
import { inputBase, labelBase } from "@/lib/form-styles";
import { ResponseError } from "@/generated";

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    let registered = false;
    try {
      await authApi.registerV1AuthRegisterPost({
        userRegister: { email, password, name },
      });
      registered = true;
      const token = await authApi.loginV1AuthLoginPost({
        userLogin: { email, password },
      });
      setToken(token.accessToken);
      router.replace("/");
    } catch (e) {
      if (registered) {
        setError(
          "アカウントを作成しましたが、ログインに失敗しました。ログイン画面からお試しください。"
        );
      } else if (e instanceof ResponseError && e.response.status === 409) {
        setError("このメールアドレスは既に登録されています。");
      } else {
        setError("登録に失敗しました。入力内容を確認してください。");
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="新規登録">
      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        {error && (
          <p
            role="alert"
            className="bg-amber-lt border border-amber text-amber text-[13px] rounded-md px-3 py-2.5"
          >
            {error}
          </p>
        )}
        <div>
          <label className={labelBase} htmlFor="name">
            お名前
          </label>
          <input
            id="name"
            type="text"
            className={inputBase}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
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
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="mt-1.5 text-[11px] text-muted">8文字以上</p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-amber py-2.5 text-[14px] font-bold text-white transition-colors duration-150 hover:bg-amber-dk disabled:opacity-50"
        >
          {submitting ? "登録中…" : "登録する"}
        </button>
        <p className="text-center text-[13px] text-muted">
          既にアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-bold text-amber hover:underline">
            ログイン
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
