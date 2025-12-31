import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertQuizQuestionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "client", "public", "images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, "kanji-" + uniqueSuffix + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.post(api.logs.create.path, async (req, res) => {
    try {
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.get(api.quizzes.list.path, async (req, res) => {
    const quizzes = await storage.getQuizzes();
    res.json(quizzes);
  });

  app.get("/api/quizzes/active", async (req, res) => {
    const quizzes = await storage.getActiveQuizzes();
    res.json(quizzes);
  });

  app.post(api.quizzes.create.path, async (req, res) => {
    try {
      const input = api.quizzes.create.input.parse(req.body);
      const quiz = await storage.createQuiz(input);
      res.status(201).json(quiz);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.patch("/api/quizzes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const existingQuiz = await storage.getQuizById(id);
      if (!existingQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      const input = api.quizzes.update.input.parse(req.body);
      
      const mergedQuiz = {
        kanji: input.kanji ?? existingQuiz.kanji,
        options: input.options ?? existingQuiz.options,
        imagePath: input.imagePath ?? existingQuiz.imagePath,
        questionJa: input.questionJa ?? existingQuiz.questionJa,
        questionEn: input.questionEn ?? existingQuiz.questionEn,
        hintJa: input.hintJa !== undefined ? input.hintJa : existingQuiz.hintJa,
        hintEn: input.hintEn !== undefined ? input.hintEn : existingQuiz.hintEn,
        isActive: input.isActive !== undefined ? input.isActive : existingQuiz.isActive,
      };
      
      insertQuizQuestionSchema.parse(mergedQuiz);
      
      const quiz = await storage.updateQuiz(id, input);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.delete("/api/quizzes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }
    const success = await storage.deleteQuiz(id);
    if (!success) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json({ success: true });
  });

  app.post("/api/upload", (req, res, next) => {
    const passcode = req.headers["x-passcode"];
    if (passcode !== "1234") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imagePath = "/images/" + req.file.filename;
    res.json({ imagePath });
  });

  return httpServer;
}
