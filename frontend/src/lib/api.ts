import {
  Configuration,
  AuthApi,
  SubjectsApi,
  UnitsApi,
  QuestionsApi,
  MistakeNotesApi,
  AttemptsApi,
  DraftsApi,
} from "@/generated";
import { clearToken, getToken } from "@/lib/auth-token";

const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  // 生成クライアントが全リクエストに Authorization: Bearer を付ける
  accessToken: () => getToken() ?? "",
  middleware: [
    {
      // 期限切れ・不正なトークンの受け口をここ1箇所に集約する。
      // ログイン失敗の 401 でループしないよう、/login にいるときは遷移しない。
      post: async ({ response }) => {
        if (
          response.status === 401 &&
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          clearToken();
          window.location.replace("/login");
        }
        return response;
      },
    },
  ],
});

export const authApi = new AuthApi(config);
export const subjectsApi = new SubjectsApi(config);
export const unitsApi = new UnitsApi(config);
export const questionsApi = new QuestionsApi(config);
export const mistakeNotesApi = new MistakeNotesApi(config);
export const attemptsApi = new AttemptsApi(config);
export const draftsApi = new DraftsApi(config);
