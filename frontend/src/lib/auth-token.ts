// JWT の保管場所。localStorage に触るのはこのファイルだけに閉じる。
const TOKEN_KEY = "misnote_token";

// Safari のプライベートブラウズやストレージ無効時、localStorage の各操作は例外を投げる。
// 読み取り・削除は「トークンが無い」として続行してよいので握りつぶすが、
// 保存の失敗だけは呼び出し元（ログイン画面）にエラーを見せたいので投げたままにする。
// ここで黙って成功させると、保存できていないのにホームへ遷移してログイン画面へ戻される。
export function getToken(): string | null {
  // SSR 中は window が無い
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // 消せなくてもこの直後のログイン画面への遷移は止めない
  }
}
