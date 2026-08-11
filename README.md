# misnote

間違えた問題・苦手な問題を記録し、ユーザーが設定した日程で反復復習できる「デジタル間違いノート」アプリ。小中高生をメインターゲットとしています。

## 主要機能

- **問題登録** — 問題文・正解・メモ（間違えた理由やポイント）を登録
- **クイック保存** — 科目も理由も選ばず、問題文だけを下書きとして書き留めて、あとで本登録する
- **間違い原因タグ** — 「読み間違い」「覚えていなかった」などの原因を記録し、苦手問題一覧で絞り込む
- **復習日設定** — 次に復習する日をユーザー自身が設定。連続正解数（1/3/7/14日）から候補日を提案するが、決めるのはユーザー
- **今日の復習** — 復習日が来た問題を自動でリストアップ
- **克服済み管理** — 3回連続正解すると「克服済みにしますか？」と提案。ユーザーが確認して初めて mastered に移行
- **科目・単元管理** — 科目・単元ごとに問題を整理

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | Next.js / TypeScript / Tailwind CSS |
| バックエンド | FastAPI (Python) / SQLAlchemy / Alembic / Pydantic |
| DB | PostgreSQL |
| API連携 | FastAPI が自動生成する OpenAPI を openapi-generator で TypeScript クライアント化し、フロントエンドはそれを利用（fetch を直書きしない） |

認証は FastAPI 自身が発行・検証するローカル JWT（HS256・有効期限7日）。`/v1/auth/register` と `/v1/auth/login` 以外の全エンドポイントがトークンを要求する。将来的には Amazon Cognito（認証）/ API Gateway / ECS+Fargate / RDS へ移行予定で、差し替わるのはトークンの検証部分のみ（詳細は `docs/ROADMAP.md`）。

## 実装状況

| フェーズ | 内容 | 状態 |
|---------|------|------|
| Phase 0 | Docker + 骨格 | ✅ 完了 |
| Phase 1 | バックエンドAPI（FastAPI + PostgreSQL） | ✅ 完了 |
| Phase 2 | フロントエンド（Next.js + 生成クライアント） | ✅ 完了 |
| Phase 3 | 認証（ローカルJWT） | ✅ 完了 |
| Phase 4 | AWS 移行（RDS / ECS / Cognito） | 未着手 |

画面はホーム `/`・問題登録 `/register`・クイック保存 `/quick`・苦手問題一覧 `/mistakes`・科目/単元管理 `/subjects`・復習 `/review/[id]`・ログイン `/login`・新規登録 `/signup`・アカウント `/account` が実装済み。

## ディレクトリ構成

```
misnote/
├── backend/   # FastAPI（実装済み）
├── frontend/  # Next.js（実装済み、全画面が実APIと接続済み）
├── docs/      # 設計ドキュメント（DB / API / 画面設計）と新機能案
└── docker-compose.yml
```

## セットアップ

### Docker を使う場合（推奨）

```bash
cp backend/.env.example backend/.env
docker compose up
```

### ローカルで直接起動する場合

**バックエンド**

```bash
cd backend
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- Swagger UI: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

シードユーザーはいないので、最初に `/v1/auth/register` でユーザーを作る。API を curl で叩く場合はログインで取得したトークンを付ける。

```bash
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "..."}'
# 返ってきた access_token を -H "Authorization: Bearer <token>" として使う
```

**フロントエンド**

```bash
cd frontend
npm install
npm run dev
```

- http://localhost:3000
- API の向き先は `NEXT_PUBLIC_API_BASE_URL`（未設定なら `http://localhost:8000`）

## テスト

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

テストは開発用とは別の PostgreSQL データベース（`misnote_test`。無ければ自動作成）に対して実行され、各テストは終了時にロールバックされる。接続先は `TEST_DATABASE_URL` で上書きできる。

## API クライアントの再生成

バックエンドのエンドポイントやスキーマを変えたら、TypeScript クライアント（`frontend/src/generated/`）を作り直す。

```bash
# バックエンドを起動した状態で
curl http://localhost:8000/openapi.json -o backend/openapi.json
cd frontend && npm run generate
```

生成には Java 11+ が必要。システムの `java` が 1.8 の場合は `JAVA_HOME=/opt/homebrew/opt/openjdk npm run generate` のように JDK を指定する。

## ドキュメント

詳しい仕様は `docs/` 以下を参照してください。

- [アプリ概要](docs/design/overview.md)
- [DB設計](docs/design/db/design.md) / [テーブル定義](docs/design/db/schema.md)
- [API共通仕様](docs/design/api/conventions.md)
- [画面設計](docs/design/screens/)
- [実装ロードマップ](docs/ROADMAP.md)
- [新機能案（構想段階・未実装）](docs/newfunction/README.md)
