# misnote-frontend

misnote の Next.js フロントエンド。全画面が実装済みで、生成した TypeScript クライアント経由で実 API に接続している。

> ⚠️ この Next.js（16.2.9）は学習データと異なる破壊的変更を含みます。コードを書く前に `AGENTS.md` と `node_modules/next/dist/docs/` を確認してください。

## 技術スタック

- Next.js 16（App Router）/ React 19
- TypeScript
- Tailwind CSS v4（カラートークンは `src/app/globals.css` の `@theme`）

## 起動方法

バックエンドを `http://localhost:8000` で起動した状態で:

```bash
npm install
npm run dev     # http://localhost:3000
```

その他のコマンド:

```bash
npm run build
npm run lint
npm run generate  # OpenAPI から API クライアントを再生成（下記参照）
```

## 環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `NEXT_PUBLIC_API_BASE_URL` | バックエンドのベースURL | `http://localhost:8000` |

`.env.local` に記述する（git 管理外）。

## 画面

| パス | 画面 |
|------|------|
| `/` | ホーム（今日の復習＋復習日未設定） |
| `/register` | 問題登録（`?draft=<id>` で下書きから本登録） |
| `/quick` | クイック保存（下書き一覧＋保存モーダル） |
| `/mistakes` | 苦手問題一覧（苦手中 / 克服済みタブ・原因タグ絞り込み） |
| `/subjects` | 科目・単元管理 |
| `/review/[id]` | 復習フロー |
| `/login` `/signup` `/account` | ログイン / 新規登録 / アカウント |

## ディレクトリ構成

```
frontend/
├── src/
│   ├── app/          # ルーティング（page.tsx は薄く保つ）
│   ├── components/   # 画面ごとの実装（home/ register/ review/ ...）
│   ├── generated/    # openapi-generator の出力（手で編集しない）
│   └── lib/
│       ├── api.ts         # 生成クライアントのシングルトン（fetch は直書きしない）
│       └── auth-token.ts  # localStorage のトークン読み書き
└── scripts/          # 生成後の後処理
```

- ナビゲーション項目は `src/components/layout/nav-items.tsx` の `NAV_ITEMS` が唯一の定義元で、サイドバー（デスクトップ）と下部ナビ（モバイル）が共有する
- サイドバー下部の克服率バー（`layout/mastery-progress.tsx`）は `GET /stats/summary` を画面遷移のたびに取り直す
- `src/components/auth/auth-gate.tsx` がトークンの有無を見て、未ログイン時は `/login` にリダイレクトする

## API クライアントの再生成

バックエンドのエンドポイントやスキーマを変えたときに実行する。

```bash
# バックエンドを起動した状態で OpenAPI を書き出しておく
curl http://localhost:8000/openapi.json -o ../backend/openapi.json
npm run generate
```

生成には Java 11+ が必要。システムの `java` が 1.8 だと弾かれるため、その場合は JDK を指定する。

```bash
JAVA_HOME=/opt/homebrew/opt/openjdk npm run generate
```
