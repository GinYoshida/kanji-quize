import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { APP_CONFIG } from "@shared/constants";

interface PasscodeEntryProps {
  onSuccess: () => void;
}

/**
 * 保護者画面に入るためのパスコード入力コンポーネント
 */
export function PasscodeEntry({ onSuccess }: PasscodeEntryProps) {
  const [code, setCode] = useState("");
  const CORRECT_CODE = APP_CONFIG.parentPasscode;

  useEffect(() => {
    // 4桁入力されたらチェックを開始
    if (code.length === 4) {
      if (code === CORRECT_CODE) {
        // 正解なら成功時の処理を呼ぶ
        onSuccess();
      } else {
        // 間違いなら少し待ってから入力をクリア
        setTimeout(() => setCode(""), 500);
      }
    }
  }, [code, onSuccess, CORRECT_CODE]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 鍵アイコンと説明テキスト */}
      <div className="flex items-center gap-2 text-primary/80 mb-2">
        <Lock className="w-5 h-5" />
        <span className="text-sm font-medium uppercase tracking-wider">Secret Code Required</span>
      </div>

      {/* 入力された数字を表示するドット部分 */}
      <div className="flex gap-4">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ 
              scale: code.length > index ? 1.1 : 1, 
              opacity: code.length > index ? 1 : 0.5,
              borderColor: code.length > index ? "var(--primary)" : "var(--border)"
            }}
            className={`
              w-12 h-16 rounded-2xl border-4 flex items-center justify-center
              text-3xl font-display font-bold text-primary bg-white shadow-sm
              transition-colors duration-200
            `}
          >
            {code.length > index ? "•" : ""}
          </motion.div>
        ))}
      </div>

      {/* 数字ボタンの並び（テンキー） */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => setCode(prev => prev.length < 4 ? prev + num : prev)}
            className="
              w-16 h-16 rounded-full bg-white text-xl font-bold text-foreground/80
              shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1
              hover:bg-primary/5 transition-all duration-150 flex items-center justify-center
            "
          >
            {num}
          </button>
        ))}
        <div /> {/* レイアウト調整用の空白 */}
        <button
          onClick={() => setCode(prev => prev.length < 4 ? prev + "0" : prev)}
          className="
            w-16 h-16 rounded-full bg-white text-xl font-bold text-foreground/80
            shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1
            hover:bg-primary/5 transition-all duration-150 flex items-center justify-center
          "
        >
          0
        </button>
        {/* 一つ消すボタン */}
        <button
          onClick={() => setCode(prev => prev.slice(0, -1))}
          className="
            w-16 h-16 rounded-full bg-red-50 text-destructive font-bold
            shadow-[0_4px_0_0_rgba(255,200,200,0.5)] active:shadow-none active:translate-y-1
            hover:bg-red-100 transition-all duration-150 flex items-center justify-center
            text-sm uppercase tracking-wide
          "
        >
          Del
        </button>
      </div>
    </div>
  );
}
