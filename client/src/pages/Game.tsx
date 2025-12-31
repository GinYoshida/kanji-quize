import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { KanjiButton } from "@/components/KanjiButton";
import { useCreateLog } from "@/hooks/use-logs";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";

// Asset paths
const IMG_SPINO = "/assets/generated_images/green-spinosaurus-boy.png";

type Question = {
  id: number;
  imageKey: string;
  kanji: string;
  options: string[];
  translations: {
    ja: { question: string; hint: string };
    en: { question: string; hint: string };
  };
};

interface QuizData {
  quizzes: Question[];
  imageMap: { [key: string]: string };
}

export default function Game() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [imageMap, setImageMap] = useState<{ [key: string]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"loading" | "playing" | "feedback" | "complete">("loading");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [, setLocation] = useLocation();
  const createLog = useCreateLog();
  const { language } = useLanguage();

  // Load quizzes from JSON
  useEffect(() => {
    fetch("/data/quizzes.json")
      .then((res) => res.json())
      .then((data: QuizData) => {
        setQuestions(data.quizzes);
        setImageMap(data.imageMap);
        setGameState("playing");
      })
      .catch((err) => {
        console.error("Failed to load quizzes:", err);
        setGameState("playing");
      });
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  // Helper to trigger confetti
  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#34D399", "#FBBF24", "#F472B6"],
    });
  };

  const handleAnswer = (kanji: string) => {
    if (gameState !== "playing" || !currentQuestion) return;

    setGameState("feedback");

    if (kanji === currentQuestion.kanji) {
      setScore((s) => s + 1);
      setFeedback("correct");
      fireConfetti();
    } else {
      setFeedback("incorrect");
    }

    // Auto advance after short delay
    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setGameState("playing");
      } else {
        setGameState("complete");
      }
    }, 2000);
  };

  const handleFinish = async () => {
    try {
      await createLog.mutateAsync({
        score,
        totalQuestions: questions.length,
      });
      setLocation("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (gameState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{language === "ja" ? "読み込み中..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (gameState === "complete" && currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-secondary/20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md w-full border-4 border-white"
        >
          <img
            src={IMG_SPINO}
            alt="Spinosaurus"
            className="w-40 h-40 mx-auto mb-6 drop-shadow-lg"
            data-testid="img-spino-complete"
          />
          <h2 className="text-4xl font-display font-bold text-primary mb-2">
            {language === "ja" ? "できました!" : "You Did It!"}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {language === "ja" ? (
              <>
                <span className="text-primary font-bold text-2xl">{score}</span>
                問 中 {questions.length} 問 正解しました！
              </>
            ) : (
              <>
                You got{" "}
                <span className="text-primary font-bold text-2xl">{score}</span>{" "}
                out of {questions.length} correct!
              </>
            )}
          </p>

          <div className="space-y-4">
            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all"
              data-testid="button-save-progress"
            >
              {createLog.isPending
                ? language === "ja"
                  ? "保存中..."
                  : "Saving..."
                : language === "ja"
                  ? "進捗を保存"
                  : "Save Progress"}
            </button>
            <Link
              href="/"
              className="block w-full py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors text-center"
              data-testid="link-play-again"
            >
              {language === "ja" ? "もう一度遊ぶ" : "Play Again"}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const currentImage = imageMap[currentQuestion.imageKey];
  const questionText =
    language === "ja"
      ? currentQuestion.translations.ja.question
      : currentQuestion.translations.en.question;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <Link
          href="/"
          className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-primary"
          data-testid="link-back"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex gap-2">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`
                h-3 rounded-full transition-all duration-500
                ${
                  idx === currentQuestionIndex
                    ? "w-8 bg-primary"
                    : idx < currentQuestionIndex
                      ? "w-3 bg-primary/40"
                      : "w-3 bg-slate-200"
                }
              `}
            />
          ))}
        </div>
        <div className="text-lg font-bold text-primary font-display" data-testid="text-progress">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-4xl flex flex-col items-center gap-8">
        {/* Question Text */}
        <div className="text-center text-xl md:text-2xl font-display font-bold text-primary mb-4">
          {questionText}
        </div>

        {/* Image Card */}
        <div className="relative w-full max-w-md aspect-[4/3] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-8 border-white overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentImage && (
              <motion.img
                key={currentQuestion.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={currentImage}
                alt="Question Image"
                className={`object-contain rounded-md ${
                  currentQuestion.imageKey === "tree" ? "w-80 h-auto" : "w-full h-full object-cover"
                }`}
                data-testid={`img-kanji-${currentQuestion.imageKey}`}
              />
            )}
          </AnimatePresence>

          {/* Feedback Overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/40 flex items-center justify-center z-10"
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className={`
                    px-8 py-4 rounded-2xl shadow-lg border-4 font-display text-4xl font-bold
                    ${
                      feedback === "correct"
                        ? "bg-green-100 border-green-400 text-green-600"
                        : "bg-yellow-100 border-yellow-400 text-yellow-600"
                    }
                  `}
                  data-testid={`feedback-${feedback}`}
                >
                  {feedback === "correct"
                    ? language === "ja"
                      ? "すごい!"
                      : "Great!"
                    : language === "ja"
                      ? "もう一度!"
                      : "Try Again!"}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Options */}
        <div className="flex gap-4 md:gap-8 mt-4">
          {currentQuestion.options.map((kanji) => (
            <KanjiButton
              key={kanji}
              kanji={kanji}
              onClick={() => handleAnswer(kanji)}
              disabled={gameState === "feedback"}
              state={
                gameState === "feedback" && kanji === currentQuestion.kanji
                  ? "correct"
                  : gameState === "feedback" && feedback === "incorrect"
                    ? "incorrect"
                    : "idle"
              }
              data-testid={`button-kanji-${kanji}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
