# 機能案：クイック保存（あとで整理）

> ✅ **2026-08-09 実装済み。** ただし下記の当初案（A案）ではなく、**独立した `drafts` リソース**として実装した。経緯と最終設計は [設計スペック](../superpowers/specs/2026-08-09-quick-save-design.md)、仕様は [画面：クイック保存](../design/screens/quick-save.md) / [API: 下書き](../design/api/drafts.md) を参照。このページは検討の記録として残す。

**目的：** 間違えた理由やポイントを書かなくても「問題だけ」を保存できるようにし、登録の心理的ハードルを下げる。理由づけは後からでもできる。

---

## 実装した設計（drafts 方式）

- `drafts(id, user_id, body, created_at)` を新設。`questions` / `mistake_notes` には一切手を触れていない
- `/quick` ページで保存（モーダル）と一覧を行う。ホーム画面には出さない
- 本登録は `/register?draft={id}` で本文を問題文に流し込み、成功後に下書きを削除する

**当初案（A案）を採らなかった理由：**

- `questions.subject_id` は NOT NULL なので、questions を使う限り「科目すら選ばずに保存」ができない。別テーブルにして初めて**本文だけの保存**が成立する
- 登録フォームの `memo` 必須（コミット d9d14c4 で意図的に入れた制約）を維持できる。方針転換が不要になった
- 「未整理」を note の有無という暗黙の状態で表現せずに済み、`/today`・`/mastered`・mastery 遷移に影響が出ない

---

## 概要（UX）※当初案

- 登録画面で **科目＋問題文だけ**で保存できる（間違えた理由・正解・復習日はすべて任意）
- 理由を書かずに保存した問題は「**未整理**」として扱い、ホーム画面に「未整理の問題」セクションを出す（既存の「復習日未設定」セクションと同列）
- 未整理の問題をタップすると、間違えた理由・学んだこと・復習日を追記できる編集画面へ遷移する

勉強中に手を止めたくない場面（授業中・模試の直後）でとにかく記録し、落ち着いてから「なぜ間違えたか」を言語化する、という2段階の使い方を可能にする。

---

## 現状との差分 ※当初案

- 現在 `QuestionCreate.memo` は必須（`backend/app/schemas/question.py` の `Field(..., min_length=1)`。コミット d9d14c4 で意図的に必須化された経緯があるため、**本機能はその方針転換であることを明記しておく**）
- mistake_note は memo / learning / next_review_at のいずれかが入力されたときのみ自動作成される（`backend/app/routers/questions.py::create_question`）
- DB 上は `mistake_notes.memo` はすでに nullable（不正解の解答記録から作られた note は理由なしで存在しうる）ので、**DBマイグレーションは不要**

---

## 設計案 ※当初案

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

## 検討事項・トレードオフ

- 「理由を書く」文化が薄れるリスク → 実装した drafts 方式では登録フォームの `memo` 必須をそのまま維持しているので、このリスクは回避できている。下書きから本登録するときは通常の登録フォームを通り、理由を書くことになる
- 未整理のまま放置された下書きの扱い → `/quick` の一覧が実質のリマインダーになる
- 検討中に「登録済みの問題にあとから正解を書き足す手段がない」という既存の穴が見つかった。クイック保存が作った穴ではないので本機能には含めず、問題編集画面として別途起こす

## 関連ドキュメント

- [設計スペック（2026-08-09）](../superpowers/specs/2026-08-09-quick-save-design.md)
- [画面：クイック保存](../design/screens/quick-save.md)
- [API: 下書き](../design/api/drafts.md)
- [画面：問題登録](../design/screens/register.md)
