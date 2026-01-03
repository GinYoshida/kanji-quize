# スピノ漢字クイズ (Spino Kanji Quiz)

ニンテンドースイッチのような親しみやすいデザインで、子供たちが楽しみながら漢字を学べる学習アプリです。

## 🌟 特徴

- **直感的なクイズ形式**: スピノサウルスのキャラクターと一緒に、画像を見ながら正しい漢字を選ぶクイズを楽しめます。
- **2ヶ国語対応**: 日本語と英語をいつでも切り替え可能。
- **進捗管理**: 学習ログを記録し、正解数や日付を確認できます。
- **管理機能**: 親御さんや先生がクイズの問題を自由に追加・編集・削除できます。
- **画像自動最適化**: 大きな画像（最大10MB）をアップロードしても、自動的に圧縮して保存します。
- **安心の認証**: Replit Authによるセキュアなログイン機能。

## 🚀 技術スタック

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Wouter
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Authentication**: Replit Auth
- **Utilities**: browser-image-compression (画像圧縮), canvas-confetti (演出)

## 🛠 セットアップ

1. **リポジトリのクローン**:
   ```bash
   git clone <repository-url>
   ```

2. **依存関係のインストール**:
   ```bash
   npm install
   ```

3. **データベースの準備**:
   ```bash
   npm run db:push
   ```

4. **アプリケーションの起動**:
   ```bash
   npm run dev
   ```

## 📝 ライセンス

MIT License
