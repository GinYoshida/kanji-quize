import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizzes, useCreateQuiz, useUpdateQuiz, useDeleteQuiz } from "@/hooks/use-quizzes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Save, X, Image, Upload } from "lucide-react";
import type { QuizQuestion, InsertQuizQuestion } from "@shared/schema";

import { ALL_KANJI, KANJI_BY_GRADE, GRADE_LABELS } from "@/data/kanji-catalog";

export default function Admin() {
  const { language } = useLanguage();
  const { data: quizzes, isLoading } = useQuizzes();
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const deleteQuiz = useDeleteQuiz();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<InsertQuizQuestion>>({
    kanji: "木",
    options: ["木", "山", "川"],
    imagePath: "/images/kanji-ki.png",
    questionJa: "この絵は、どの漢字でしょう？",
    questionEn: "What kanji is this picture?",
    hintJa: "",
    hintEn: "",
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      kanji: "木",
      options: ["木", "山", "川"],
      imagePath: "/images/kanji-ki.png",
      questionJa: "この絵は、どの漢字でしょう？",
      questionEn: "What kanji is this picture?",
      hintJa: "",
      hintEn: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (quiz: QuizQuestion) => {
    setFormData({
      kanji: quiz.kanji,
      options: quiz.options,
      imagePath: quiz.imagePath,
      questionJa: quiz.questionJa,
      questionEn: quiz.questionEn,
      hintJa: quiz.hintJa || "",
      hintEn: quiz.hintEn || "",
      isActive: quiz.isActive ?? true,
    });
    setEditingId(quiz.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const quizData: InsertQuizQuestion = {
      kanji: formData.kanji!,
      options: formData.options!,
      imagePath: formData.imagePath!,
      questionJa: formData.questionJa!,
      questionEn: formData.questionEn!,
      hintJa: formData.hintJa || null,
      hintEn: formData.hintEn || null,
      isActive: formData.isActive,
    };

    try {
      if (editingId) {
        await updateQuiz.mutateAsync({ id: editingId, updates: quizData });
      } else {
        await createQuiz.mutateAsync(quizData);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(language === "ja" ? "この問題を削除しますか？" : "Delete this question?")) {
      await deleteQuiz.mutateAsync(id);
    }
  };

  const handleOptionToggle = (kanji: string) => {
    const current = formData.options || [];
    if (current.includes(kanji)) {
      setFormData({ ...formData, options: current.filter((k) => k !== kanji) });
    } else {
      setFormData({ ...formData, options: [...current, kanji] });
    }
  };

  const handleFileUpload = async (e: { target: HTMLInputElement }) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-passcode": "1234",
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFormData({ ...formData, imagePath: data.imagePath });
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/logs"
              className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-primary"
              data-testid="link-back-to-logs"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary">
              {language === "ja" ? "クイズ管理" : "Quiz Management"}
            </h1>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} data-testid="button-add-quiz">
              <Plus className="w-4 h-4 mr-2" />
              {language === "ja" ? "追加" : "Add"}
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">
                  {editingId
                    ? language === "ja"
                      ? "問題を編集"
                      : "Edit Question"
                    : language === "ja"
                      ? "新しい問題"
                      : "New Question"}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "ja" ? "正解の漢字" : "Correct Kanji"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_KANJI.map((k) => (
                        <button
                          key={k}
                          onClick={() => setFormData({ ...formData, kanji: k })}
                          className={`w-10 h-10 rounded-lg text-xl font-bold transition-all ${
                            formData.kanji === k
                              ? "bg-primary text-white shadow-lg"
                              : "bg-slate-100 hover:bg-slate-200"
                          }`}
                          data-testid={`button-select-kanji-${k}`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "ja" ? "選択肢（3つ選んでください）" : "Options (select 3)"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_KANJI.map((k) => (
                        <button
                          key={k}
                          onClick={() => handleOptionToggle(k)}
                          className={`w-10 h-10 rounded-lg text-xl font-bold transition-all ${
                            formData.options?.includes(k)
                              ? "bg-secondary text-secondary-foreground shadow"
                              : "bg-slate-100 hover:bg-slate-200"
                          }`}
                          data-testid={`button-option-${k}`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === "ja"
                        ? `選択中: ${formData.options?.join(", ")}`
                        : `Selected: ${formData.options?.join(", ")}`}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Image className="w-4 h-4 inline mr-1" />
                      {language === "ja" ? "画像" : "Image"}
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                        data-testid="input-image-file"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        data-testid="button-upload-image"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading
                          ? language === "ja"
                            ? "アップロード中..."
                            : "Uploading..."
                          : language === "ja"
                            ? "画像をアップロード"
                            : "Upload Image"}
                      </Button>
                    </div>
                    {formData.imagePath && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                        <img
                          src={formData.imagePath}
                          alt="Preview"
                          className="w-32 h-32 object-contain rounded-md mx-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === "ja" ? "質問（日本語）" : "Question (Japanese)"}
                      </label>
                      <input
                        type="text"
                        value={formData.questionJa || ""}
                        onChange={(e) => setFormData({ ...formData, questionJa: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                        data-testid="input-question-ja"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {language === "ja" ? "質問（英語）" : "Question (English)"}
                      </label>
                      <input
                        type="text"
                        value={formData.questionEn || ""}
                        onChange={(e) => setFormData({ ...formData, questionEn: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                        data-testid="input-question-en"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5"
                      data-testid="checkbox-is-active"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                      {language === "ja" ? "この問題を有効にする" : "Enable this question"}
                    </label>
                  </div>

                  {formData.options && formData.options.length !== 3 && (
                    <p className="text-sm text-red-500">
                      {language === "ja"
                        ? "選択肢は3つ選んでください"
                        : "Please select exactly 3 options"}
                    </p>
                  )}

                  {formData.options && !formData.options.includes(formData.kanji || "") && (
                    <p className="text-sm text-red-500">
                      {language === "ja"
                        ? "正解の漢字を選択肢に含めてください"
                        : "The correct kanji must be included in the options"}
                    </p>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        createQuiz.isPending ||
                        updateQuiz.isPending ||
                        !formData.kanji ||
                        formData.options?.length !== 3 ||
                        !formData.options?.includes(formData.kanji) ||
                        !formData.imagePath
                      }
                      data-testid="button-save-quiz"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {createQuiz.isPending || updateQuiz.isPending
                        ? language === "ja"
                          ? "保存中..."
                          : "Saving..."
                        : language === "ja"
                          ? "保存"
                          : "Save"}
                    </Button>
                    <Button variant="outline" onClick={resetForm} data-testid="button-cancel">
                      <X className="w-4 h-4 mr-2" />
                      {language === "ja" ? "キャンセル" : "Cancel"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : quizzes?.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              {language === "ja"
                ? "まだ問題がありません。上の「追加」ボタンで問題を作成してください。"
                : "No questions yet. Click 'Add' above to create one."}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {quizzes?.map((quiz) => (
              <Card
                key={quiz.id}
                className={`p-4 flex items-center gap-4 ${!quiz.isActive ? "opacity-50" : ""}`}
                data-testid={`card-quiz-${quiz.id}`}
              >
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={quiz.imagePath}
                    alt={quiz.kanji}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl font-bold">{quiz.kanji}</span>
                    {!quiz.isActive && (
                      <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                        {language === "ja" ? "無効" : "Disabled"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ja" ? quiz.questionJa : quiz.questionEn}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "ja" ? "選択肢" : "Options"}: {quiz.options.join(", ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(quiz)}
                    data-testid={`button-edit-${quiz.id}`}
                  >
                    {language === "ja" ? "編集" : "Edit"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(quiz.id)}
                    className="text-red-500 hover:text-red-700"
                    data-testid={`button-delete-${quiz.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
