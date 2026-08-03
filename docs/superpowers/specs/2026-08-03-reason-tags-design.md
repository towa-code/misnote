# 設計：間違い原因タグ

作成日: 2026-08-03
元になった構想: [`docs/newfunction/mistake-reason-tags.md`](../../newfunction/mistake-reason-tags.md)

## 目的

「なぜ間違えたか」をフリーテキストの `memo` だけでなく構造化されたタグとしても記録し、
「自分はどういうタイプのミスが多いか」を見返せるようにする。

## 決定事項

ブレストで決めた6点。以降の設計はすべてこれに従う。

| # | 論点 | 決定 | 理由 |
|---|---|---|---|
| 1 | タグの粒度 | **問題につき1つの分類**（`mistake_notes` に持つ） | 「自分は計算ミスが多い」を知るには十分。attempts 側に持つと履歴は残るが、登録時は attempt が存在しないため扱いが複雑になる |
| 2 | 入力場所 | **問題登録画面と復習画面の両方** | 付け忘れ・分類の見直しに対応できる。どちらも既存画面で、新しい画面は作らない |
| 3 | タグの一覧 | **解く過程で切る6つ** | 「計算ミス」と「ケアレスミス」のように重なる分類があると選択がブレて統計が濁る |
| 4 | スコープ | **入力＋一覧バッジ＋タグ別件数チップ** | タグは見返せて初めて価値が出る。専用の統計画面は別機能（stats-dashboard）に残す |
| 5 | DB での型 | **VARCHAR ＋ Pydantic `Literal`** | タグ一覧は変わる前提。ネイティブ ENUM だと増減のたびに `ALTER TYPE` が要る |
| 6 | タグの解除 | **`reason_tag` のみ `model_fields_set` で判定** | 分類を直せないのは実用上つらい。既存3フィールドの挙動は変えない |

## タグの定義

英語キーが API と DB に流れる値、日本語ラベルはフロントエンドだけが持つ。
文言を変えるときに DB もマイグレーションも触らずに済む。

| キー | 表示ラベル |
|---|---|
| `misread` | 読み間違い |
| `approach` | 解き方が思いつかなかった |
| `knowledge` | 覚えていなかった |
| `calculation` | 計算・作業ミス |
| `time` | 時間切れ |
| `other` | その他 |

「解く過程のどこで失敗したか」（読む → 方針 → 知識 → 手を動かす → 時間）で切ってあるため、
分類同士が重ならない。

## バックエンド

### DB

`mistake_notes` に `reason_tag VARCHAR NULL` を追加する Alembic マイグレーション1本。
既存レコードは `null`（= 未分類）のまま残るのでデータ移行は不要。
初期スキーマ以来はじめての追加マイグレーションになる。

### スキーマ

`app/schemas/mistake_note.py` に定義を置き、他モジュールはここから import する。

```python
ReasonTag = Literal["misread", "approach", "knowledge", "calculation", "time", "other"]
```

- `QuestionCreate` に `reason_tag: ReasonTag | None = None`
- `MistakeNoteUpdate` に `reason_tag: ReasonTag | None = None`
- `MistakeNoteResponse` に `reason_tag: ReasonTag | None`

不正な値は Pydantic が 422 で弾く。書き込み経路は下の2エンドポイントだけで、
どちらも Pydantic を通るため DB 制約がなくても不正な値は入らない。

### エンドポイント

新規エンドポイントは作らない。

| エンドポイント | 変更 |
|---|---|
| `POST /v1/questions` | `reason_tag` を受け取り、作成するノートに設定する |
| `PUT /v1/mistake-notes/{id}` | `reason_tag` を更新する。`null` を明示的に送ると解除 |
| ノートを返す全エンドポイント | レスポンスに `reason_tag` を含める |

**`routers/questions.py::create_question` のノート自動生成条件を変える必要がある。**
現在は次のとおりで、タグだけを付けて登録するとノートが作られない。

```python
if body.memo or body.learning or body.next_review_at:   # ← or body.reason_tag を追加
```

**`routers/mistake_notes.py::update_note` の更新判定。**
既存の3フィールドは `if body.X is not None` で判定しており、`null` を送っても
「未指定」と区別できないため値を消せない。`reason_tag` だけは送信の有無で判定する。

```python
if "reason_tag" in body.model_fields_set:
    note.reason_tag = body.reason_tag
```

1つの関数の中で判定方法が2種類混ざるが、既存フィールドの挙動を変えない
（＝リグレッションを持ち込まない）ことを優先した。

## フロントエンド

### 新規ファイル

| ファイル | 役割 |
|---|---|
| `src/lib/reason-tags.ts` | キーとラベルの対応。日本語ラベルの唯一の定義 |
| `src/components/reason-tag/tag-picker.tsx` | 選択用チップ。登録画面と復習画面で共用 |
| `src/components/reason-tag/tag-badge.tsx` | 表示用バッジ。一覧で使う |

### 変更する画面

| 画面 | 変更 |
|---|---|
| 問題登録（`register-form.tsx`） | 「間違えた理由」欄の上にチップ行を置く。任意項目。選択済みをもう一度押すと解除 |
| 復習・不正解時（`judge-panel.tsx`） | アンバーのメモ編集欄にチップ行を置く。初期値はノートの現在のタグ。保存時に一緒に送る |
| 苦手問題一覧（`mistake-row.tsx` / `mistakes-content.tsx`） | 各行の「科目 › 単元」の隣にバッジ。一覧の上にタグ別の件数チップを並べ、タップで絞り込み |

件数チップは取得済みの一覧を数えて表示するため、集計用の API は追加しない。
「未分類」もチップの1つとして出す（既存ノートがここに入り、分類を促す導線になる）。

正解時の緑セクションにはタグを出さない。正解した直後に「なぜ間違えたか」を聞くのは
不自然なため。副作用として、タグの付け間違いは次に不正解になるまで直せない。

### 生成クライアント

スキーマ変更後に `openapi.json` を再生成し `npm run generate` を実行する
（`JAVA_HOME=/opt/homebrew/opt/openjdk` が必要）。

## テスト

`backend/tests/` に追加する。

- タグ付きで問題を登録すると、ノートに `reason_tag` が保存される
- **タグだけを指定して登録してもノートが作られる**（`create_question` の分岐の回帰テスト）
- 不正なタグ文字列は 422
- `PUT /v1/mistake-notes/{id}` でタグを変更できる
- 同エンドポイントに `null` を送るとタグが外れる
- `reason_tag` を送らなければ既存のタグが維持される
- タグなしの既存ノートはレスポンスで `reason_tag: null` になる

フロントエンドは従来どおり `npm run lint` と `npx tsc --noEmit`、および画面の手動確認で見る。

## やらないこと

- 統計ダッシュボード（`docs/newfunction/stats-dashboard.md` として独立させたまま）
- 1問に複数タグ（中間テーブル）・ユーザー定義タグ
- 科目ごとに違うタグ一覧
- タグによるサーバー側の絞り込み（`GET /v1/mistake-notes?reason_tag=`）。
  一覧はクライアント側で絞るため不要
- 正解時にタグを編集する導線

## 記録：スコープ外の既存の挙動

`PUT /v1/mistake-notes/{id}` は `memo` / `learning` / `next_review_at` を
**`null` にできない**（`is not None` 判定のため）。とくに `next_review_at` を
「未設定に戻す」操作が API 上できない。今回は既存の挙動を維持するため触らないが、
別途対応する価値がある。

## 関連ドキュメント

- [構想：間違い原因タグ](../../newfunction/mistake-reason-tags.md)
- [構想：統計ダッシュボード](../../newfunction/stats-dashboard.md)
- [API: 間違いノート](../../design/api/mistake-notes.md)
- [DB設計](../../design/db/design.md)
