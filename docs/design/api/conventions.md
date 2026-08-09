# API共通仕様

## 基本情報

| 項目 | 内容 |
|-----|-----|
| ベースURL | `http://localhost:8000/v1`（Phase 4 で `https://api.misnote.com/v1`） |
| 認証方式 | FastAPI が発行する JWT（HS256・有効期限7日）。Phase 4 で Cognito に差し替え |
| データ形式 | JSON |

### 認証ヘッダー

```
Authorization: Bearer {ログインAPIが返すJWT}
```

---

## ページネーション（一覧系API共通）

一覧を返すAPI（`GET /questions`、`GET /mistake-notes` 系）は以下のクエリパラメータを受け付ける。

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|----------|------|
| limit | INTEGER | 100 | 取得件数の上限 |
| offset | INTEGER | 0 | 取得開始位置 |

---

## エラーレスポンス

| ステータスコード | 意味 |
|----------------|------|
| 400 | ビジネスルール違反（例：単元が指定科目に属していない） |
| 401 | 認証エラー（トークンが無効） |
| 404 | データが見つからない |
| 409 | 競合エラー（紐づくデータが存在するため削除不可） |
| 422 | バリデーションエラー（必須項目の欠落・型不一致。FastAPI が自動で返す） |
| 500 | サーバーエラー |

> 形式チェック（Pydantic）は 422、形式は正しいが業務的に不正なリクエストは 400 を使う
>
> 他ユーザーのデータへのアクセスは、存在自体を秘匿するため 403 ではなく 404 を返す。

**エラーレスポンスの形式**
```json
{
  "detail": "Question not found"
}
```

---

## OpenAPI Generator

### 概要

FastAPIは実装するだけで `openapi.json` を自動生成する。
そのJSONをopenapi-generatorに渡すことで、Next.js用のコードを自動生成できる。

### 生成されるもの

| 生成物 | 使う場所 | 説明 |
|--------|---------|------|
| TypeScript型定義 | Next.js | APIのリクエスト・レスポンスの型 |
| APIクライアント | Next.js | fetchを自分で書かなくていい |

### 手順

**① FastAPI起動後、JSONを取得**
```bash
curl http://localhost:8000/openapi.json -o openapi.json
```

**② openapi-generatorでNext.js用コードを生成**
```bash
openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-fetch \
  -o ./frontend/src/generated
```

**③ 生成されたコードを使う**
```typescript
import { QuestionsApi } from '@/generated'

const api = new QuestionsApi()
const questions = await api.getQuestions()
```

### 生成されるフォルダ構成

```
frontend/src/generated/
├── apis/
│   ├── QuestionsApi.ts
│   ├── MistakeNotesApi.ts
│   └── SubjectsApi.ts
└── models/
    ├── Question.ts
    ├── MistakeNote.ts
    └── Attempt.ts
```

---

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/auth/register` | ユーザー登録 |
| POST | `/auth/login` | ログイン（JWTを返す） |
| GET | `/auth/me` | ログイン中のユーザー情報 |
| GET | `/subjects` | 科目一覧取得 |
| POST | `/subjects` | 科目作成 |
| PUT | `/subjects/{id}` | 科目更新 |
| DELETE | `/subjects/{id}` | 科目削除 |
| GET | `/subjects/{subject_id}/units` | 単元一覧取得 |
| POST | `/subjects/{subject_id}/units` | 単元作成 |
| PUT | `/units/{id}` | 単元更新 |
| DELETE | `/units/{id}` | 単元削除 |
| GET | `/questions` | 問題一覧取得 |
| GET | `/questions/{id}` | 問題詳細取得 |
| POST | `/questions` | 問題作成 |
| PUT | `/questions/{id}` | 問題更新 |
| DELETE | `/questions/{id}` | 問題削除 |
| POST | `/questions/{id}/attempts` | 回答を記録 |
| GET | `/questions/{id}/attempts` | 回答履歴一覧取得 |
| GET | `/mistake-notes` | 苦手問題一覧取得 |
| GET | `/mistake-notes/today` | 今日の復習一覧取得 |
| GET | `/mistake-notes/mastered` | 克服済み一覧取得 |
| GET | `/mistake-notes/{id}` | 間違いノート詳細取得 |
| PUT | `/mistake-notes/{id}` | メモ・復習日を更新 |
| PUT | `/mistake-notes/{id}/status` | ステータス変更 |
| GET | `/drafts` | 下書き一覧取得 |
| GET | `/drafts/{id}` | 下書き取得 |
| POST | `/drafts` | 下書き作成 |
| DELETE | `/drafts/{id}` | 下書き削除 |
| GET | `/stats/summary` | 克服率の件数取得 |

---

## 関連ドキュメント

- [アプリ概要](../overview.md)
- [科目API](./subjects.md)
- [単元API](./units.md)
- [問題API](./questions.md)
- [回答API](./attempts.md)
- [間違いノートAPI](./mistake-notes.md)
- [下書きAPI](./drafts.md)
- [統計API](./stats.md)
