# 機能案：問題の写真登録

> ⚠️ **エージェントへ：** この機能は構想段階です。ユーザーが明示的に実装を指示するまで実装しないでください。

**目的：** 問題集や答案をスマホで撮影してそのまま問題として登録できるようにする。図形問題・長文問題などテキスト入力が現実的でない問題を扱えるようにし、登録の負担を大きく下げる。

---

## 概要（UX）

- 登録画面の問題文欄の横に「写真を追加」ボタン（`<input type="file" accept="image/*" capture="environment">` でスマホならカメラが直接起動）
- 写真だけ・写真＋補足テキストのどちらでも登録できる（問題文テキストは写真がある場合任意にする）
- 復習画面・一覧・詳細で画像をサムネイル/拡大表示する

[クイック保存](./quick-save.md)と組み合わせると「間違えた問題を撮るだけ」という最小の登録体験になる。

---

## 設計方針

- **画像は1問1枚から始める**（`questions.image_path` カラム1本）。複数枚（問題＋解答解説など）が欲しくなったら `question_images` テーブルに移行する
- 保存先はストレージ層を1枚関数で抽象化し、差し替え可能にする:
  - ローカル（現フェーズ）: `backend/uploads/{user_id}/{uuid}.jpg` に保存し FastAPI の StaticFiles か専用エンドポイントで配信
  - AWS（Phase 4）: S3 に保存し、配信は presigned URL または CloudFront

---

## API/DB 変更点

| 種別 | 変更 |
|------|------|
| DB | `questions` に `image_path` (String, nullable) を追加。Alembic マイグレーション |
| API | `POST /v1/questions/{id}/image`（multipart/form-data、画像を保存して `image_path` 更新）/ `DELETE /v1/questions/{id}/image` / 画像配信 `GET /v1/questions/{id}/image` |
| レスポンス | `QuestionResponse` に `image_url: str \| None` を追加 |
| 依存 | `python-multipart`（FastAPI のファイルアップロードに必要）— **新規依存のため導入前にユーザー承認** |
| フロント | 登録画面のファイル入力＋プレビュー、一覧・復習画面での画像表示 |

バリデーション: MIME タイプ（jpeg/png/webp のみ）、サイズ上限（例: 5MB）、必要ならサーバー側で長辺リサイズ。

---

## 実装ステップ

1. `image_path` カラム追加のマイグレーション
2. ストレージ関数（`app/services/storage.py`: `save_image()` / `delete_image()` / `image_url()`）をローカル実装で作成
3. 画像アップロード/削除/配信エンドポイント追加
4. `openapi.json` 再生成 → `npm run generate`（※ multipart はクライアント生成の対応状況を確認）
5. フロントの撮影/選択 UI とプレビュー、各画面の画像表示
6. （Phase 4 で）ストレージ関数を S3 実装に差し替え

---

## 検討事項・トレードオフ

- **アクセス制御:** 認証導入前は配信 URL を知っていれば誰でも見える。ローカル開発では許容し、Phase 3（認証）以降で配信エンドポイントにも認可を必須にする
- 問題を丸ごと撮影して公開的な場所に置くと著作権の懸念があるため、**画像は本人のみ閲覧可能**という前提を守る（共有機能には載せない）
- 容量: ローカルはディスク、S3 は費用。リサイズ＋上限で抑える。EXIF（位置情報）はサーバー側で除去する
- OCR で写真から問題文テキストを起こす案は [AI補助](./ai-assist.md) の拡張として扱う

## 関連ドキュメント

- [機能案：クイック保存](./quick-save.md)
- [機能案：AI補助](./ai-assist.md)
- [実装ロードマップ（Phase 4: AWS）](../ROADMAP.md)
