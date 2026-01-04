import { db } from "./db";
import { eq, or, and } from "drizzle-orm";
import {
  learningLogs,
  quizQuestions,
  type InsertLearningLog,
  type LearningLog,
  type InsertQuizQuestion,
  type QuizQuestion,
} from "@shared/schema";

export interface IStorage {
  getLogsByUser(userId: string): Promise<LearningLog[]>;
  createLog(log: InsertLearningLog): Promise<LearningLog>;
  getQuizzesByUser(userId: string, isOwner: boolean): Promise<QuizQuestion[]>;
  getActiveQuizzesByUser(userId: string): Promise<QuizQuestion[]>;
  getQuizById(id: number): Promise<QuizQuestion | null>;
  createQuiz(quiz: InsertQuizQuestion): Promise<QuizQuestion>;
  updateQuiz(id: number, quiz: Partial<InsertQuizQuestion>): Promise<QuizQuestion | null>;
  deleteQuiz(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedDefaultQuizzes();
  }

  /**
   * Seeds the database with default quiz questions if none exist.
   * This ensures the published version has content immediately.
   */
  private async seedDefaultQuizzes() {
    try {
      const existing = await db.select().from(quizQuestions).limit(1);
      if (existing.length === 0) {
        console.log("Seeding default quiz questions...");
        const defaultQuizzes: InsertQuizQuestion[] = [
          {
            kanji: "山",
            options: ["木", "山", "川"],
            imagePath: "/images/kanji-1767457029322-256273483.png",
            questionJa: "この絵は、どの漢字でしょう？",
            questionEn: "What kanji is this picture?",
            hintJa: null,
            hintEn: null,
            isActive: true,
            isGlobal: true,
            ownerUserId: "52141230"
          },
          {
            kanji: "川",
            options: ["木", "川", "日"],
            imagePath: "/images/kanji-1767458012418-286830973.png",
            questionJa: "この絵は、どの漢字でしょう？",
            questionEn: "What kanji is this picture?",
            hintJa: null,
            hintEn: null,
            isActive: true,
            isGlobal: true,
            ownerUserId: "52141230"
          },
          {
            kanji: "木",
            options: ["木", "日", "月"],
            imagePath: "/images/kanji-1767458046729-312304328.png",
            questionJa: "この絵は、どの漢字でしょう？",
            questionEn: "What kanji is this picture?",
            hintJa: null,
            hintEn: null,
            isActive: true,
            isGlobal: true,
            ownerUserId: "52141230"
          },
          {
            kanji: "一",
            options: ["一", "三", "五"],
            imagePath: "/images/kanji-1767458527057-57653435.png",
            questionJa: "スピノサウルスの数はどれ？",
            questionEn: "How many Spinosaurus?",
            hintJa: null,
            hintEn: null,
            isActive: true,
            isGlobal: true,
            ownerUserId: "52141230"
          },
          {
            kanji: "火",
            options: ["火", "木", "水"],
            imagePath: "/images/kanji-1767461622827-801016801",
            questionJa: "この絵は、どの漢字でしょう？",
            questionEn: "What kanji is this picture?",
            hintJa: null,
            hintEn: null,
            isActive: true,
            isGlobal: true,
            ownerUserId: "52141230"
          },
          {
            kanji: "二",
            options: ["一", "三", "二"],
            imagePath: "/images/kanji-1767462149179-264980170",
            questionJa: "この絵は、どの漢字でしょう？",
            questionEn: "What kanji is this picture?",
            hintJa: null,
            hintEn: null,
            isActive: true,
            isGlobal: true,
            ownerUserId: "52141230"
          },
          {
            kanji: "三",
            options: ["三", "二", "四"],
            imagePath: "/images/kanji-1767463251145-225352797",
            questionJa: "この絵は、どの漢字でしょう？",
            questionEn: "What kanji is this picture?",
            hintJa: null,
            hintEn: null,
            isActive: true,
            isGlobal: true,
            ownerUserId: "52141230"
          }
        ];

        for (const quiz of defaultQuizzes) {
          await db.insert(quizQuestions).values(quiz);
        }
        console.log("Seeding complete.");
      }
    } catch (error) {
      console.error("Error seeding default quizzes:", error);
    }
  }

  /**
   * Retrieves all learning logs for a specific user.
   * @param userId - Unique identifier of the user
   * @returns Array of learning logs sorted by completion date
   */
  async getLogsByUser(userId: string): Promise<LearningLog[]> {
    return await db.select().from(learningLogs)
      .where(eq(learningLogs.userId, userId))
      .orderBy(learningLogs.completedAt);
  }

  /**
   * Creates a new learning log entry.
   * @param insertLog - Learning log data to insert
   * @returns The created learning log record
   */
  async createLog(insertLog: InsertLearningLog): Promise<LearningLog> {
    const [log] = await db.insert(learningLogs).values(insertLog).returning();
    return log;
  }

  /**
   * Retrieves quiz questions available to a user.
   * @param userId - Unique identifier of the user
   * @param isOwner - Whether the user has administrative privileges
   * @returns Array of quiz questions
   */
  async getQuizzesByUser(userId: string, isOwner: boolean): Promise<QuizQuestion[]> {
    if (isOwner) {
      return await db.select().from(quizQuestions);
    }
    return await db.select().from(quizQuestions).where(
      or(
        eq(quizQuestions.isGlobal, true),
        eq(quizQuestions.ownerUserId, userId)
      )
    );
  }

  /**
   * Retrieves active quiz questions available to a user.
   * @param userId - Unique identifier of the user
   * @returns Array of currently active quiz questions
   */
  async getActiveQuizzesByUser(userId: string): Promise<QuizQuestion[]> {
    return await db.select().from(quizQuestions).where(
      and(
        eq(quizQuestions.isActive, true),
        or(
          eq(quizQuestions.isGlobal, true),
          eq(quizQuestions.ownerUserId, userId)
        )
      )
    );
  }

  /**
   * Retrieves a specific quiz question by its ID.
   * @param id - Unique identifier of the quiz question
   * @returns The quiz question or null if not found
   */
  async getQuizById(id: number): Promise<QuizQuestion | null> {
    const [quiz] = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id));
    return quiz || null;
  }

  /**
   * Creates a new quiz question.
   * @param insertQuiz - Quiz question data to insert
   * @returns The created quiz question record
   */
  async createQuiz(insertQuiz: InsertQuizQuestion): Promise<QuizQuestion> {
    const [quiz] = await db.insert(quizQuestions).values(insertQuiz).returning();
    return quiz;
  }

  /**
   * Updates an existing quiz question.
   * @param id - Unique identifier of the quiz to update
   * @param updates - Partial quiz data containing fields to update
   * @returns The updated quiz question or null if not found
   */
  async updateQuiz(id: number, updates: Partial<InsertQuizQuestion>): Promise<QuizQuestion | null> {
    const [quiz] = await db.update(quizQuestions).set(updates).where(eq(quizQuestions.id, id)).returning();
    return quiz || null;
  }

  /**
   * Deletes a specific quiz question.
   * @param id - Unique identifier of the quiz to delete
   * @returns True if deletion was successful, false otherwise
   */
  async deleteQuiz(id: number): Promise<boolean> {
    const result = await db.delete(quizQuestions).where(eq(quizQuestions.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
