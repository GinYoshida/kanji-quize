/**
 * プロジェクト全体で共有される設定定数
 * 初心者の方でも、ここを書き換えるだけでアプリの挙動を調整できます
 */

export const UPLOAD_CONFIG = {
  maxFileSizeMB: 10,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  uploadDir: "client/public/images",
  filePrefix: "kanji-",
};

export const APP_CONFIG = {
  // 保護者画面に入るためのパスコード
  parentPasscode: "1234",
  // クイズの問題数選択肢（0は全問）
  quizQuestionOptions: [5, 10, 15, 0] as const,
  // デフォルトの問題数
  defaultQuestionCount: 10,
  // フィードバック表示時間（ミリ秒）
  feedbackDuration: {
    correct: 2000,
    incorrect: 1500
  }
};
