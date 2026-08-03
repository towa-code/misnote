# API：間違いノート（mistake-notes）

ベースURL: `https://api.misnote.com/v1` / 認証・エラー: [共通仕様](./conventions.md)

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/mistake-notes` | 苦手問題一覧取得（active） |
| GET | `/mistake-notes/today` | 今日の復習一覧取得 |
| GET | `/mistake-notes/mastered` | 克服済み一覧取得 |
| GET | `/mistake-notes/{id}` | 間違いノート詳細取得 |
| PUT | `/mistake-notes/{id}` | メモ・復習日を更新 |
| PUT | `/mistake-notes/{id}/status` | ステータス変更（克服済み化・苦手に戻す） |

### レスポンス共通形（mistake_notes オブジェクト）

画面で科目名・単元名を表示するため、`question` には `subject`・`unit` を含める（`unit` は未設定なら `null`）。全エンドポイントで同じ形を返す。

```json
{
  "id": "uuid",
  "question": {
    "id": "uuid",
    "subject": { "id": "uuid", "name": "数学" },
    "unit": { "id": "uuid", "name": "二次方程式" },
    "question_text": "次の方程式を解け: 2x + 3 = 7",
    "correct_answer": "x = 2"
  },
  "memo": "符号のミスに注意",
  "learning": "移項するとき符号が反転することを公式として覚える",
  "reason_tag": "calculation",
  "status": "active",
  "wrong_count": 3,
  "correct_streak": 1,
  "next_review_at": "2024-01-08"
}
```

---

## 苦手問題一覧取得
`GET /mistake-notes`

status が `active` の一覧を返す。[ページネーション](./conventions.md)対応（limit/offset）。

**レスポンス** — 上記共通形の配列

---

## 今日の復習一覧取得
`GET /mistake-notes/today`

`next_review_at` が今日以前で `status` が `active` の一覧を返す。

> `next_review_at` が `null` のノートは含まれない。未設定分の扱い（「復習日未設定」セクション）は [画面設計: ホーム](../screens/home.md) を参照

**レスポンス** — 上記共通形の配列

---

## 克服済み一覧取得
`GET /mistake-notes/mastered`

status が `mastered` の一覧を返す。[ページネーション](./conventions.md)対応（limit/offset）。

**レスポンス** — 上記共通形の配列（`status: "mastered"`、`next_review_at: null`）

---

## 間違いノート詳細取得
`GET /mistake-notes/{id}`

復習画面への直接アクセス（URL指定・リロード）で使う。

**レスポンス** — 上記共通形の1件

---

## メモ・復習日を更新
`PUT /mistake-notes/{id}`

**リクエスト**
```json
{
  "memo": "符号のミスに注意。移項するとき符号が変わる",
  "learning": "移項するとき符号が反転することを公式として覚える",
  "reason_tag": "calculation",
  "next_review_at": "2024-01-08"
}
```

**レスポンス** — 上記共通形

> すべて省略可。`memo`・`learning`・`next_review_at` は省略時のみ現在値が維持される
> （`null` を送っても消せない）。`reason_tag` だけは送信の有無で判定するため、
> 明示的に `null` を送るとタグを外せる。

---

## ステータス変更
`PUT /mistake-notes/{id}/status`

克服済みへの変更（`mastered`）と、克服済みから苦手への復帰（`active`）の両方に使う。

**リクエスト**
```json
{ "status": "mastered" }
```

**レスポンス** — 上記共通形

> - `mastered` にすると `next_review_at` は `null` にクリアされる  
> - `active` に戻した場合、`correct_streak` は 0 にリセットし、復習日はユーザーが改めて設定する

---

## 関連ドキュメント

- [共通仕様](./conventions.md)
- [回答API](./attempts.md)（correct_streak の更新タイミング）
- [DB: 設計思想](../db/design.md)（correct_streak・mastery ルール）
- [画面設計: 復習](../screens/review.md)
- [画面設計: 苦手問題一覧](../screens/mistake-list.md)
