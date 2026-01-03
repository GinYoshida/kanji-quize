import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { PasscodeEntry } from "@/components/PasscodeEntry";
import { Play, BookOpen, LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";

const SPINOSAURUS_IMG = "/assets/generated_images/green-spinosaurus-boy.png";

const MAX_QUESTIONS_OPTIONS = [5, 10, 15, 0] as const;

export default function Landing() {
  const [showPasscode, setShowPasscode] = useState(false);
  const [maxQuestions, setMaxQuestions] = useState<number>(10);
  const [, setLocation] = useLocation();
  const { language, setLanguage } = useLanguage();
  const { user, isLoading, isAuthenticated } = useAuth();

  const handleStartGame = () => {
    setLocation(`/game?max=${maxQuestions}`);
  };

  const handleParentsScreen = () => {
    setShowPasscode(true);
  };

  const handlePasscodeSuccess = () => {
    setLocation("/logs");
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Language Selector */}
      <div className="absolute top-6 right-6 flex gap-2 z-20">
        <button
          onClick={() => setLanguage("ja")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            language === "ja"
              ? "bg-primary text-white shadow-lg"
              : "bg-white text-muted-foreground hover:bg-slate-100"
          }`}
          data-testid="button-lang-ja"
        >
          日本語
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            language === "en"
              ? "bg-primary text-white shadow-lg"
              : "bg-white text-muted-foreground hover:bg-slate-100"
          }`}
          data-testid="button-lang-en"
        >
          English
        </button>
      </div>

      {/* User status indicator */}
      {isAuthenticated && user && (
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm z-20">
          <span className="text-sm text-muted-foreground">
            {user.firstName || user.email || "User"}
          </span>
          <button
            onClick={() => window.location.href = "/api/logout"}
            className="text-xs text-red-500 hover:text-red-700 underline"
            data-testid="button-logout"
          >
            {language === "ja" ? "ログアウト" : "Logout"}
          </button>
        </div>
      )}

      {/* Decorative Blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-secondary/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />

      <div className="max-w-2xl w-full flex flex-col items-center z-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-white p-6 rounded-[2rem] shadow-xl shadow-primary/10 border-4 border-primary/20 mb-8 relative">
             <motion.img 
              src={SPINOSAURUS_IMG}
              alt="Spinosaurus"
              className="w-32 h-32 mx-auto object-contain mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            />
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary text-shadow-lg tracking-wide mb-2">
              {language === "ja" ? "スピノサウルス" : "Spinosaurus"}
              <br/>
              <span className="text-foreground">{language === "ja" ? "漢字クイズ" : "Kanji Quiz"}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-body">
              {language === "ja" ? "いっしょに学ぼう!" : "Let's learn together!"}
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showPasscode ? (
            <motion.div 
              key="buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col gap-4 w-full max-w-sm"
            >
              {!isAuthenticated && !isLoading && (
                <button
                  onClick={handleLogin}
                  className="
                    group relative w-full py-6 px-8 rounded-3xl
                    bg-gradient-to-r from-primary to-emerald-400
                    text-white font-display text-2xl font-bold tracking-wide
                    shadow-[0_8px_0_0_#059669] hover:shadow-[0_4px_0_0_#059669] hover:translate-y-1
                    active:shadow-none active:translate-y-2
                    transition-all duration-150 flex items-center justify-center gap-4
                    overflow-hidden
                  "
                  data-testid="button-login"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-3xl" />
                  <LogIn className="w-8 h-8" />
                  {language === "ja" ? "ログインして始める" : "Login to Start"}
                </button>
              )}

              {isAuthenticated && (
                <>
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl mb-4">
                    <label className="block text-sm font-medium text-muted-foreground mb-2 text-center">
                      {language === "ja" ? "問題数" : "Number of Questions"}
                    </label>
                    <div className="flex gap-2 justify-center">
                      {MAX_QUESTIONS_OPTIONS.map((num) => (
                        <button
                          key={num}
                          onClick={() => setMaxQuestions(num)}
                          className={`px-4 py-2 rounded-xl font-bold transition-all ${
                            maxQuestions === num
                              ? "bg-primary text-white shadow-lg"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                          data-testid={`button-max-questions-${num}`}
                        >
                          {num === 0 ? (language === "ja" ? "全部" : "All") : num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleStartGame}
                    className="
                      group relative w-full py-6 px-8 rounded-3xl
                      bg-gradient-to-r from-primary to-emerald-400
                      text-white font-display text-2xl font-bold tracking-wide
                      shadow-[0_8px_0_0_#059669] hover:shadow-[0_4px_0_0_#059669] hover:translate-y-1
                      active:shadow-none active:translate-y-2
                      transition-all duration-150 flex items-center justify-center gap-4
                      overflow-hidden
                    "
                    data-testid="button-start-quiz"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-3xl" />
                    <Play className="w-8 h-8 fill-current" />
                    {language === "ja" ? "クイズをはじめる" : "Start Quiz"}
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-muted-foreground">
                        {language === "ja" ? "大人用" : "For Grown-Ups"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleParentsScreen}
                    className="
                      w-full py-4 px-6 rounded-2xl
                      bg-white border-2 border-border
                      text-muted-foreground font-bold hover:text-primary hover:border-primary
                      shadow-sm hover:shadow-md transition-all duration-200
                      flex items-center justify-center gap-2
                    "
                    data-testid="button-view-logs"
                  >
                    <BookOpen className="w-5 h-5" />
                    {language === "ja" ? "保護者画面" : "Parent Screen"}
                  </button>
                </>
              )}

              {isLoading && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="passcode"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl border border-white/50 w-full max-w-sm"
            >
              <PasscodeEntry onSuccess={handlePasscodeSuccess} />
              <button 
                onClick={() => setShowPasscode(false)}
                className="w-full mt-6 text-sm text-muted-foreground hover:text-primary transition-colors underline decoration-dotted"
                data-testid="button-go-back"
              >
                {language === "ja" ? "戻る" : "Go Back"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="absolute bottom-4 text-center w-full text-sm text-muted-foreground/60">
        {language === "ja" ? "小さな学習者のために愛を込めて" : "Made with love for little learners"}
      </footer>
    </div>
  );
}
