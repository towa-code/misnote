// JWT の保管場所。localStorage に触るのはこのファイルだけに閉じる。
const TOKEN_KEY = "misnote_token";

export function getToken(): string | null {
  // SSR 中は window が無い
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}
