# misnote-backend

misnote の FastAPI バックエンド。

## 技術スタック

- Python 3.12+
- FastAPI
- SQLAlchemy 2.0 + Alembic
- PostgreSQL 16
- Pydantic v2
- 認証: python-jose（JWT・HS256）+ bcrypt（パスワードハッシュ）

## 起動方法

### Docker を使う場合（推奨）

環境変数を設定してから、リポジトリルートの `docker-compose.yml` で起動します。venv は不要です。

```bash
cp .env.example .env
cd ..
docker compose up
```

### ローカルで直接起動する場合

PostgreSQL を別途起動した上で、venv を作成して起動します。

```bash
cp .env.example .env
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## マイグレーション

```bash
# 初回：マイグレーションファイルを自動生成
alembic revision --autogenerate -m "init"

# DB に適用
alembic upgrade head

# ロールバック
alembic downgrade -1
```

## テスト

```bash
pip install -r requirements-dev.txt
pytest
```

- 開発用とは別の PostgreSQL データベース `misnote_test`（無ければ自動作成）に対して実行し、各テストは終了時にロールバックする。接続先は `TEST_DATABASE_URL` で上書きできる
- `tests/conftest.py` の `client` フィクスチャは `get_current_user_id` をオーバーライドするため、大半のテストは実トークンを必要としない。認証そのものを検証するテストは `anon_client` を使う

## 認証

`/v1/auth/register` と `/v1/auth/login` 以外の全エンドポイントが `Authorization: Bearer {token}` を要求します（`app/deps.py::get_current_user_id`）。トークンは FastAPI 自身が発行する JWT（HS256・有効期限7日）。シードユーザーは無く、登録直後のアカウントはデータが空の状態から始まります。

```bash
curl -X POST http://localhost:8000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your-password", "name": "あなたの名前"}'
```

`password` は8文字以上かつ UTF-8 で72バイト以内（bcrypt の上限）。

Phase 4 では AWS Cognito に差し替える予定で、変わるのは `deps.py` の検証処理のみです。

## API ドキュメント

起動後に以下の URL で確認できます。

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json
- ヘルスチェック: http://localhost:8000/health

## ディレクトリ構成

```
misnote-backend/
├── app/
│   ├── main.py        # FastAPI アプリ・ルーター登録
│   ├── config.py      # 環境変数の読み込み
│   ├── database.py    # DB 接続・Base
│   ├── deps.py        # 共通 Depends（DB セッション・JWT 検証）
│   ├── auth.py        # パスワードハッシュ・JWT のユーティリティ
│   ├── models/        # SQLAlchemy モデル（7テーブル）
│   ├── schemas/       # Pydantic スキーマ
│   └── routers/       # エンドポイント
├── alembic/           # マイグレーション管理
├── tests/             # pytest（misnote_test DB を使用）
├── alembic.ini
├── requirements.txt
├── requirements-dev.txt
└── Dockerfile
```

テーブルは `users` / `subjects` / `units` / `questions` / `attempts` / `mistake_notes` / `drafts` の7つ。

## 環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `DATABASE_URL` | PostgreSQL 接続文字列 | `postgresql://misnote:misnote@localhost:5432/misnote` |
| `SECRET_KEY` | JWT 署名キー | `change-me-in-production` |
