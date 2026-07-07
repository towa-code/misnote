# 機能案：クイック保存（あとで整理）

> ⚠️ **エージェントへ：** この機能は構想段階です。ユーザーが明示的に実装を指示するまで実装しないでください。

**目的：** 間違えた理由やポイントを書かなくても「問題だけ」を保存できるようにし、登録の心理的ハードルを下げる。理由づけは後からでもできる。

---

## 概要（UX）

- 登録画面で **科目＋問題文だけ**で保存できる（間違えた理由・正解・復習日はすべて任意）
- 理由を書かずに保存した問題は「**未整理**」として扱い、ホーム画面に「未整理の問題」セクションを出す（既存の「復習日未設定」セクションと同列）
- 未整理の問題をタップすると、間違えた理由・学んだこと・復習日を追記できる編集画面へ遷移する

勉強中に手を止めたくない場面（授業中・模試の直後）でとにかく記録し、落ち着いてから「なぜ間違えたか」を言語化する、という2段階の使い方を可能にする。

---

## 現状との差分

- 現在 `QuestionCreate.memo` は必須（`backend/app/schemas/question.py` の `Field(..., min_length=1)`。コミット d9d14c4 で意図的に必須化された経緯があるため、**本機能はその方針転換であることを明記しておく**）
- mistake_note は memo / learning / next_review_at のいずれかが入力されたときのみ自動作成される（`backend/app/routers/questions.py::create_question`）
- DB 上は `mistake_notes.memo` はすでに nullable（不正解の解答記録から作られた note は理由なしで存在しうる）ので、**DBマイグレーションは不要**

---

## 設計案

### A案（推奨）：memo を任意に戻し、「note なし＝未整理」とする

- `QuestionCreate.memo` を `str | None = None` に戻す
- note 自動作成の条件（memo / learning / next_review_at のいずれか入力時）は現行のまま
- 「未整理」= mistake_note を持たない問題。`GET /v1/questions` に `has_note: bool` クエリパラメータを追加して抽出する
- 長所: 変更が最小。既存のドメインルール（note の作成・mastery 判定）に一切触れない
- 短所: 「未整理」という状態が暗黙的（note の有無で表現される）

### B案：mistake_notes.status に `unorganized` を追加する

- 保存時に常に note を作り、理由未記入なら `status="unorganized"` とする
- 長所: 状態が明示的
- 短所: enum 変更のマイグレーション、`/today`・`/mastered`・mastery 遷移など status を見る全ロジックと全画面に影響。コスト大のため非推奨

---

## API/DB 変更点（A案）

| 種別 | 変更 |
|------|------|
| スキーマ | `QuestionCreate.memo` を `str \| None = None` に変更（`app/schemas/question.py`） |
| API | `GET /v1/questions` に `has_note` クエリ追加（`app/routers/questions.py::list_questions` で mistake_note の有無で絞り込み） |
| DB | 変更なし |
| フロント | 登録画面: 必須マークの変更とバリデーション緩和。ホーム画面: 「未整理の問題」セクション追加（`GET /v1/questions?has_note=false`） |

---

## 実装ステップ

1. `QuestionCreate.memo` を任意化し、`openapi.json` 再生成 → フロントの生成クライアント更新（`npm run generate`）
2. `list_questions` に `has_note` フィルタを追加
3. 登録画面のバリデーション・必須マークを更新（間違えた理由を「あとで書ける」ことをプレースホルダで示す）
4. ホーム画面に「未整理の問題」セクションを追加

---

## 検討事項・トレードオフ

- 「理由を書く」文化が薄れるリスク → ホームの未整理セクションと件数バッジで「あとで書く」ことを促す設計にする。理由記入済みかどうかを問題一覧でも見えるようにするとよい
- 未整理のまま放置された問題の扱い（復習対象に入らない）→ 未整理セクションが実質のリマインダーになる
- `docs/design/screens/register.md` は元々「間違えた理由: 任意」だったが、現実装では「正解: 任意 / 理由: 必須」に逆転している。採用時は register.md と `docs/design/api/questions.md` の必須表も更新すること

## 関連ドキュメント

- [画面：問題登録](../design/screens/register.md)
- [画面：ホーム](../design/screens/home.md)
- [API: 問題](../design/api/questions.md)
