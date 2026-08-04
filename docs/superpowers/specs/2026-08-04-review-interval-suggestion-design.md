# 設計：復習日の自動提案

作成日: 2026-08-04
元になった構想: [`docs/newfunction/review-interval-suggestion.md`](../../newfunction/review-interval-suggestion.md)

## 目的

「次はいつ復習すればいいか分からない」を解消する。忘却曲線ライクな間隔でアプリが次回復習日を
提案し、ワンタップで日付欄に入る。ただし決めるのはユーザーで、自動では設定しない。
既存の `mastery_suggested`（3連続正解で克服を提案するだけで自動遷移しない）と同じ思想。

## 決定事項

ブレストで決めた3点。

| # | 論点 | 決定 | 理由 |
|---|---|---|---|
| 1 | 提案日の計算場所 | **バックエンド**（`AttemptResponse` に `suggested_next_review_at` を追加） | 復習ルールは既に `MASTERY_THRESHOLD` としてバックエンドにある。間隔もそこに並べると復習ポリシーが1箇所に集まり pytest で検証できる |
| 2 | チップをタップしたときの挙動 | **日付入力欄に値を入れるだけ**。保存は既存の「保存してホームへ」 | 不正解分岐ではメモ・タグを編集中なので、即 PUT すると入力を捨てるか二重保存になる。押した後に手動で直せるのも自然 |
| 3 | 登録画面のクイックチップ | **今回のスコープに含める**（+1日 / +3日 / +7日） | フロントだけで完結し、復習画面のチップと同じ見た目を使い回せる |

## 提案ロジック

解答後の `correct_streak` で間隔を決める。SM-2 のような本格 SRS はやらない。

| correct_streak（解答後） | 提案間隔 |
|---|---|
| 0（間違えた直後） | 翌日 |
| 1 | 3日後 |
| 2 | 7日後 |
| 3以上 | 14日後（このとき `mastery_suggested` も立つ） |

不正解時は `correct_streak` が 0 にリセットされた後の値を使うので、自動的に「翌日」になる。
`wrong_count` は見ない（間違うほど短くする案もあるが、まずは単純に）。

## バックエンド

`app/routers/attempts.py`:

```python
MASTERY_THRESHOLD = 3
SUGGEST_INTERVALS = [1, 3, 7, 14]   # correct_streak 0 / 1 / 2 / 3以上


def _suggest_next_review(correct_streak: int) -> date:
    days = SUGGEST_INTERVALS[min(correct_streak, len(SUGGEST_INTERVALS) - 1)]
    return date.today() + timedelta(days=days)
```

- `app/schemas/attempt.py` の `AttemptResponse` に `suggested_next_review_at: date | None` を追加
- ノートが無い（一度も間違えていない問題に正解した）ケースは `correct_streak` が `None` なので提案も `None`
- 基準日は `date.today()`。既存の `GET /mistake-notes/today` と同じ基準
- **DB 変更なし・新エンドポイントなし。** 提案の適用は既存の `PUT /v1/mistake-notes/{id}`

### テスト

`backend/tests/test_review_suggestion.py`（新規）

- streak 0 / 1 / 2 / 3以上 の4パターンで返る日付が今日 +1 / +3 / +7 / +14 になる
- 不正解の直後は（それまでの streak によらず）翌日
- ノートが無い問題に正解したときは `null`

## フロントエンド

### `src/lib/review-date.ts`（新規）

- `addDays(n)` — 今日から n 日後の `Date`
- `toDateInput(d)` — `<input type="date">` 用の `YYYY-MM-DD`
- `formatSuggestion(d)` — 「8月7日（3日後）」

`judge-panel.tsx` にある `toDateInput`（`toISOString` ベース）はここへ移し、ローカル日付ベースにする。
ローカルで作った `Date` を `toISOString` に通すとタイムゾーンで1日ずれるため。日付は端末のローカル
日付基準で扱う（JST 想定）。

### `src/components/review-date/date-chip.tsx`（新規）

復習画面と登録画面で見た目を揃えるだけの小さなボタン。選択済み状態を持つ。

### 復習画面

- `review-flow.tsx`: attempt レスポンスの `suggestedNextReviewAt` を state に保持し `JudgePanel` に渡す
- `judge-panel.tsx`: 正解・不正解どちらの分岐でも「次の復習日」入力の直上に提案チップを1つ表示。
  タップで入力欄に日付が入る。入力欄の値が提案日と一致していれば選択済みスタイル
- 提案が `null` のときはチップを出さない

### 登録画面

- `register-form.tsx`: 復習日欄の下に「+1日 / +3日 / +7日」の3チップ。今日基準でフロント計算のみ

## やらないこと

- ユーザーごとの間隔カスタマイズ（YAGNI）
- SM-2 等の ease factor 学習。`mistake_notes` へのカラム追加が必要になり、
  「自分で復習日を決める」というこのアプリの個性と競合する
- 提案日の自動適用。提案止まりにする

## 関連ドキュメント

- [画面：復習](../../design/screens/review.md)
- [画面：問題登録](../../design/screens/register.md)
- [API: 解答記録](../../design/api/attempts.md)
