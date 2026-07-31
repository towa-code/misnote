# 認証（ローカルJWT） — 設計

## 背景

Phase 2（全5画面の実装）が完了し、ROADMAP の次は Phase 3「認証」。
現状は認証が一切なく、`backend/app/deps.py::get_current_user_id()` が固定のシードユーザー
UUID（`00000000-0000-0000-0000-000000000001`）を返している。

Phase 4 で AWS Cognito に差し替える前提のため、ここではローカル完結の JWT を FastAPI 側で
発行・検証する。Cognito 移行時に変わるのは「トークンをどう検証するか」だけになるよう、
検証処理を 1 箇所（`deps.py`）に閉じ込める。

土台は既に用意されている:

| 項目 | 状態 |
|---|---|
| `python-jose` 3.5.0 | `backend/requirements.txt` に記載済み。JWT の発行・検証が動作することを確認済み |
| `users.email`(unique), `users.password_hash` カラム | 初期マイグレーション `aaf1f33b3324` に含まれる（**追加マイグレーション不要**） |
| `SECRET_KEY` の設定読み込み | `app/config.py`（値は `change-me-in-production` のまま） |
| `get_current_user_id()` という差し込み口 | `app/deps.py`（全ルーターが `Depends` 経由で使用、計21箇所） |

元になった仕様: `docs/ROADMAP.md` Phase 3、`docs/design/api/conventions.md`。

## 決定事項（ユーザー確認済み）

1. **トークンは localStorage に保存する。** httpOnly Cookie より XSS に弱いが、実装が単純で
   生成クライアントの `Authorization` ヘッダー方式と素直に噛み合う。学習フェーズのため許容する。
2. **アクセストークンのみ。リフレッシュトークンは作らない。** 有効期限は 7 日。
3. **既存データは捨てて作り直す。** シードユーザーに紐づく科目・単元・問題・ノート・回答履歴は
   全て破棄し、新規登録したユーザーで一から作り直す。
4. **新規登録は公開する。** 招待コード等の登録制限は設けない。
5. **パスワードハッシュは `bcrypt` を直接使う。** `passlib` は依存から外す（理由は後述）。
6. **`email-validator` を依存に追加する。** `EmailStr` でメール形式を Pydantic に検証させる。

## 依存関係の変更

`backend/requirements.txt` を次のように変更する。

| 変更 | 行 | 理由 |
|---|---|---|
| 削除 | `passlib[bcrypt]>=1.7.4` | **インストール済みの bcrypt 5.0.0 と組み合わせて動作しない**（下記） |
| 追加 | `bcrypt>=5.0.0` | passlib 経由をやめて直接使う。`hashpw` / `checkpw` の2関数のみ |
| 変更 | `pydantic>=2.10.0` → `pydantic[email]>=2.10.0` | `EmailStr` に必要な `email-validator` を extras で入れる（未インストール） |

### passlib を外す理由（実機で確認済み）

`passlib 1.7.4` は bcrypt バックエンドの初期化時に、既知バグの有無を調べる目的で 72 バイトを
超えるパスワードを内部的にハッシュ化しようとする。bcrypt 5.0.0 はこれを黙って切り詰めず
`ValueError: password cannot be longer than 72 bytes` を投げるため、**アプリ側が
ハッシュ化を一度も呼ぶ前に例外で落ちる。** passlib は 2020 年以降更新が止まっており修正の
見込みが薄い。

`bcrypt` を直接呼ぶ形は動作確認済み。passlib はもともと薄いラッパーとしてしか使わないため、
依存が1つ減る方向の変更になる。

`python-multipart` は form-data 用に入っていたが、ログインを JSON にする本設計では使わない。
既存の依存であり本タスクとは無関係なため、**削除はせず残す**（他用途の可能性があるため）。

## テスト方針（ユーザー確認済み）

**バックエンドに pytest のテスト基盤を作り、認証の実装より先に整える。** フロントエンドの
テストフレームワークは導入しない（検証はブラウザ操作の手順で行う）。

| 項目 | 方針 |
|---|---|
| 依存 | `backend/requirements-dev.txt` に `pytest` と `httpx`。`Dockerfile` は `requirements.txt` しか入れないので本番イメージは太らない |
| DB | PostgreSQL 上の別 DB `misnote_test`。モデルが `postgresql.UUID` と ネイティブ ENUM を使うため SQLite は不可 |
| 分離 | テストごとに外側のトランザクションを巻き戻す（`Session(bind=connection, join_transaction_mode="create_savepoint")`） |
| 認証の迂回 | `client` fixture が `get_current_user_id` を**依存オーバーライド**で差し替える。これにより、この関数の中身が JWT 検証に変わっても既存機能のテストは無変更で通り続ける |
| 認証自体のテスト | オーバーライドしない `anon_client` fixture を使い、実際にトークンを発行して検証する |

先に `subjects` / `units` / mistake-note 規則の回帰テストを書き、認証導入で壊れたときに
検知できる網を張ってから `deps.py` に手を入れる。

## トークン仕様

| 項目 | 値 |
|---|---|
| アルゴリズム | HS256（共通鍵、`settings.secret_key` で署名） |
| ペイロード | `sub`: user_id（str）, `exp`: 発行から7日後 |
| 送信ヘッダー | `Authorization: Bearer {token}` |
| セキュリティスキーム | `HTTPBearer` |

JWT のペイロードは Base64 で誰でも読めるため、`sub` と `exp` 以外は入れない。

`SECRET_KEY` が漏れると任意のユーザーになりすませる。`backend/.env` は現在
`change-me-in-production` のままなので、**開発用のランダム値に差し替える**
（`.env` は gitignore 済み。`.env.example` はプレースホルダのまま変更しない）。

`OAuth2PasswordRequestForm`（FastAPI の定番）は採用しない。リクエストが form-data になり
フィールド名が `username` 固定で email を入れる形になるため、生成 TS クライアントとの相性が悪い。
`HTTPBearer` + JSON ボディにする。代償は Swagger UI の Authorize がトークン手貼りになる点のみ。

## バックエンド

### `app/auth.py`（新規）

パスワードと JWT のユーティリティ。DB にもリクエストにも依存しない純粋な関数のみ。

| 関数 | 役割 |
|---|---|
| `hash_password(plain: str) -> str` | `bcrypt.hashpw` でハッシュ化（bytes ↔ str の変換もここで吸収） |
| `verify_password(plain: str, hashed: str) -> bool` | `bcrypt.checkpw` で照合 |
| `create_access_token(user_id: UUID) -> str` | `sub`/`exp` を詰めて署名 |
| `decode_access_token(token: str) -> UUID \| None` | 検証して user_id を返す。失敗時は `None`（jose の例外を外に漏らさない） |

有効期限（`ACCESS_TOKEN_EXPIRE_DAYS = 7`）はこのモジュールの定数として持つ。

### `app/schemas/auth.py`（新規）

| スキーマ | フィールド |
|---|---|
| `UserRegister` | `email: EmailStr`, `password: str`(8文字以上), `name: str`(1文字以上) |
| `UserLogin` | `email: EmailStr`, `password: str` |
| `TokenResponse` | `access_token: str`, `token_type: str = "bearer"` |
| `UserResponse` | `id: UUID`, `email: str`, `name: str` |

**パスワードの上限は「72 バイト」であって「72 文字」ではない。** bcrypt 5.0 は 72 バイトを超える
入力を切り詰めずエラーにするが、日本語は UTF-8 で 1 文字 3 バイトのため、文字数だけで
`max_length=72` を掛けると最大 216 バイトが通ってしまい 500 になる。`UserRegister` に
バリデータを1つ足し、`len(password.encode("utf-8")) <= 72` を検証する（超過は 422）。

### `app/routers/auth.py`（新規、`/v1/auth` にマウント）

| メソッド | パス | 挙動 |
|---|---|---|
| POST | `/register` | email 重複なら 409。ハッシュ化して `User` を作成し 201 + `UserResponse` |
| POST | `/login` | email でユーザーを引き、パスワード照合。成功で 200 + `TokenResponse` |
| GET | `/me` | トークンから user_id を取り、`UserResponse` を返す |

- **登録はトークンを返さない。** フロントが続けてログインを呼ぶ。register の責務を1つに保ち、
  将来「登録→メール確認」を挟む余地を残すため。
- **ログイン失敗は 401 で、メール未登録とパスワード不一致を区別しない**（同一メッセージ
  `"Incorrect email or password"`）。どのメールが登録済みかを外部に漏らさないため。
- `/register` と `/login` は認証不要。`/me` のみ認証必須。

### `app/deps.py`（変更）

`get_current_user_id()` を JWT 検証に差し替える。

```
HTTPBearer で Authorization ヘッダーを取得
  → decode_access_token() で user_id を復元
  → 失敗（欠落・改ざん・期限切れ）は 401 + WWW-Authenticate: Bearer
```

**この関数の差し替えだけで既存の全エンドポイントが認証必須になる。** 各ルーターは変更しない。
`SEED_USER_ID` 定数は削除する。

DB 上のユーザー存在確認はこの依存では行わない（トークンが有効＝発行済み、かつ現状ユーザー削除
機能がないため）。存在しない user_id で他人のデータが見えることはない（全クエリが user_id 一致で
絞られるため、結果が空になるだけ）。ただしこれは読み取り系に限った話で、書き込み系（作成）は
別: 存在しない user_id で `POST` すると外部キー制約違反になり 500 を返す。ユーザー削除機能が
存在しない現状では到達不能なケースだが、正確を期すために明記しておく。

### `app/routers/units.py`（変更 — 既存の穴を塞ぐ）

現在 `units.py` は `get_current_user_id` を import しているが**一度も使っておらず**、4つの
エンドポイント全てに所有者チェックがない。他人の `subject_id` を指定すれば単元を読み書きできる。
ユーザーが1人の間は実害がないが、認証を入れた時点でここだけがデータ分離の穴になる。
（`CLAUDE.md` は「units は subject_id 経由で間接的にスコープされる」と記述しているが、コードは
そうなっていない。この修正で記述が実態に一致する。）

このファイルにローカルヘルパーを1つ置き、4エンドポイント全てで所有者を検証する:

- `list_units` / `create_unit`: `subject_id` の科目が自分のものか確認 → 違えば 404
- `update_unit` / `delete_unit`: 単元の所属科目を辿って確認 → 違えば 404

**403 ではなく 404 を返す。** 既存ルーターは user_id で絞り込んだ結果として他人のデータに
404 を返しており、それに揃える（存在自体を漏らさない利点もある）。
`docs/design/api/conventions.md` の 403 の記述はこの方針に合わせて更新する。

### `app/seed.py` の削除

既存データを破棄する方針のため、固定シードユーザーとサンプル科目の自動生成は不要になる。

- `app/seed.py` を削除
- `app/main.py` の `lifespan`（中身が seed 呼び出しのみ）を削除

**新規登録したユーザーに科目を自動作成しない。** 「数学」「英語」が勝手に生えるのは実アプリとして
不自然なため。登録後は `/subjects` で自分の科目を作るところから始まる。

## DB のリセット

構造変更（マイグレーション追加）は不要。データのみ破棄する。
この構成では DB のみ Docker、API は `backend/.venv` の uvicorn で動かしている。

```
docker compose down -v          # 名前付きボリューム misnote_postgres_data ごと削除
docker compose up -d db
cd backend && .venv/bin/alembic upgrade head    # 空のDBにスキーマを作り直す
```

**科目・単元・問題・苦手ノート・回答履歴が全て消える。** 実行前にユーザーへ最終確認する。

## フロントエンド

### 新規ルート

| ルート | 内容 |
|---|---|
| `/login` | ログインフォーム。`/signup` へのリンク |
| `/signup` | 新規登録フォーム。登録成功後そのままログインしてホームへ |
| `/account` | 自分の名前・メール表示とログアウトボタン |

`page.tsx` は薄く保ち、実体は `src/components/auth/` 配下に置く（既存画面と同じ構成）。

### `src/lib/auth-token.ts`（新規）

localStorage の読み書きを閉じ込める。`getToken()` / `setToken()` / `clearToken()` の3関数。
SSR 中は `window` が無いため `getToken()` は `typeof window === "undefined"` で `null` を返す。

### `src/lib/api.ts`（変更）

`Configuration` に 2 つ追加する。ここを直せば**全 API 呼び出しに一括で効く**。

- `accessToken: () => getToken() ?? ""` — 生成クライアントが Bearer ヘッダーを自動付与する
- `middleware` — レスポンスが 401 のときトークンを消して `/login` へ遷移。
  期限切れの受け口を1箇所に集約する

`AuthApi`（生成される）のシングルトンも追加する。

### `src/components/auth/auth-gate.tsx`（新規、`"use client"`）

`app/layout.tsx` で `AppShell` の外側に置き、認証状態に応じて出し分ける。

- `/login`・`/signup` → `AppShell` を通さず中身だけ描画（サイドバー・ボトムナビを出さない）
- トークン無し → `router.replace("/login")`
- トークン有り → 従来どおり `<AppShell>{children}</AppShell>`

localStorage はサーバー側から読めないため、**Next.js の middleware では判定できない**
（decision 1 の帰結）。クライアント側ガードになる。
初回レンダリング時はまだ localStorage を読めないので、判定前は空を描画してから
`useEffect` で確定させる（ここを省くと hydration mismatch になる）。

### ログアウト導線

`src/components/layout/nav-items.tsx` の `NAV_ITEMS` に「アカウント」（`/account`）を追加する。
`NAV_ITEMS` はサイドバー（PC）とボトムナビ（モバイル）の唯一の定義元なので、
**1箇所の追加で両方に出る。** ログアウトボタンはサイドバーではなく `/account` 画面に置く。

## ドキュメント更新

| ファイル | 更新内容 |
|---|---|
| `docs/design/api/conventions.md` | 認証方式を Cognito 前提からローカル JWT に。`/auth/*` をエンドポイント一覧へ追加。403 の記述を 404 方針に合わせる |
| `docs/ROADMAP.md` | Phase 3 のチェックリストを完了に。現在地を更新。ライブラリ記述（`passlib` → `bcrypt`）を修正 |
| `CLAUDE.md` | 「認証なし・シードユーザー固定」の記述を差し替え |
| `docs/CLAUDE.md` | Architecture Summary の Auth 記述を更新 |

## 実装順

各ステップで単独に動作確認できる単位に切る。

1. `requirements.txt` の更新 + `app/auth.py` — 4関数
   （DB もサーバーも不要な純粋関数なので、ここだけ単独で往復確認できる）
2. `app/schemas/auth.py` + `app/routers/auth.py` — register/login/me
   （**既存 API は無防備のままなのでアプリは壊れない**）
3. `deps.py` 差し替え + `units.py` の所有者チェック + seed 削除
   （ここでフロントの全画面が 401 で壊れる。想定内）
4. DB リセット
5. `npm run generate` → フロントエンド実装
6. ドキュメント更新

## スコープ外

- リフレッシュトークン、トークンのブラックリスト（即時ログアウト）
- パスワード変更・リセット、メールアドレス確認
- ユーザー削除・退会
- レート制限、ログイン試行回数制限
- ソーシャルログイン、Cognito 連携（Phase 4）
- httpOnly Cookie 方式への切り替え
- 既存データの移行（捨てる方針のため）
