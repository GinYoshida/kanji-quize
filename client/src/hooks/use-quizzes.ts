import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { QuizQuestion, InsertQuizQuestion } from "@shared/schema";

/**
 * Custom hook to fetch all quiz questions for the current user.
 * @returns React Query result containing array of quiz questions
 */
export function useQuizzes() {
  return useQuery<QuizQuestion[]>({
    queryKey: ["/api/quizzes"],
  });
}

/**
 * Custom hook to fetch only active quiz questions.
 * @returns React Query result containing array of active quiz questions
 */
export function useActiveQuizzes() {
  return useQuery<QuizQuestion[]>({
    queryKey: ["/api/quizzes/active"],
  });
}

/**
 * Custom hook to create a new quiz question.
 * @returns React Query mutation for creating a quiz
 */
export function useCreateQuiz() {
  return useMutation({
    mutationFn: async (quiz: InsertQuizQuestion) => {
      const res = await apiRequest("POST", "/api/quizzes", quiz);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes/active"] });
    },
  });
}

/**
 * Custom hook to update an existing quiz question.
 * @returns React Query mutation for updating a quiz
 */
export function useUpdateQuiz() {
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertQuizQuestion> }) => {
      const res = await apiRequest("PATCH", `/api/quizzes/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes/active"] });
    },
  });
}

/**
 * Custom hook to delete a quiz question.
 * @returns React Query mutation for deleting a quiz
 */
export function useDeleteQuiz() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/quizzes/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes/active"] });
    },
  });
}
