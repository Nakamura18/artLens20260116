# Artistic Heartscape — 画家の心象風景を重ねる、タイムトラベル・ガイド

2026/1/10 最新のArtLens

このプロジェクトは、AI（Google Gemini API）を活用して、単なる美術解説を超えた「没入型アート体験」を提供するWebアプリケーションです。

## 🌟 主な機能

- **Empathy Timeline（感情の年表）**: 画家の生涯における「感情の起伏」をグラフで可視化。作品がどのような精神状態で描かれたかを直感的に理解できます。
- **時代背景のオーバーレイ**: 作品画像の上に、当時の社会情勢や技術革新、個人的な出来事などのインサイトを重ねて表示します。
- **AI学芸員による深掘り解説**: Gemini 3 Flashモデルを使用し、教科書には載っていない「裏話」や「スキャンダル」をエモーショナルに解説します。

## 🛠 技術スタック

- **Frontend**: React 19, Tailwind CSS
- **Visualization**: Recharts
- **Icons**: Lucide React
- **AI**: Google Generative AI (Gemini API)

## 🚀 セットアップ

1. リポジトリをクローンします。
2. `npm install` で依存関係をインストールします。
3. `.env.local` を作成し、`VITE_GEMINI_API_URL=your_backend_url` を設定してください。
4. `npm run dev` でローカル開発サーバーを起動します。

## 🔐 Gemini API をバックエンドに隠す（推奨）

このプロジェクトには Firebase Functions 用の Gemini プロキシを同梱しています。

### 必要な環境変数（バックエンド）

- `GEMINI_API_KEY`: Gemini API キー
- `ALLOWED_ORIGINS`: 許可するオリジン（例: `http://localhost:3000,https://nakamura18.github.io`）

### ローカル開発（Functions）

1. `firebase login` でログイン
2. `firebase use <your-project-id>`
3. `cd functions && npm install && npm run build`
4. `firebase emulators:start --only functions`

### フロント側の設定

`.env.local` に Functions の URL を設定します。

例（エミュレータ）:
`VITE_GEMINI_API_URL=http://127.0.0.1:5001/<project-id>/asia-northeast1/gemini`

## 📦 GitHub Pagesへのデプロイ

このプロジェクトはGitHub Actionsを使用して自動的にGitHub Pagesにデプロイされます。

### 初回セットアップ

1. **GitHubリポジトリの設定**:
   - リポジトリの Settings → Pages に移動
   - Source を "GitHub Actions" に設定

2. **シークレットの設定**（Functions で利用する場合）:
   - Firebase Functions に `GEMINI_API_KEY` を設定してください

3. **デプロイの実行**:
   - `main` ブランチにプッシュすると、自動的にビルドとデプロイが実行されます
   - Actions タブでデプロイの進行状況を確認できます
   - デプロイが完了すると、`https://mamna18.github.io/artistic_heartscape_guide/` でアクセスできます

---
*Created with Gemini API*
