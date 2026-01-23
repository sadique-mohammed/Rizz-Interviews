import { pgTable, serial, text, timestamp, integer, uuid, varchar } from "drizzle-orm/pg-core";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  authProvider: varchar("auth_provider", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignInAt: timestamp("last_sign_in_at"),
});

// Interviews
export const interviews = pgTable("interviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").references(() => users.id),
  domain: varchar("domain", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  duration: integer("duration").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  status: varchar("status", { length: 20 }).default("in_progress"),
  totalScore: integer("total_score"),
});

// Questions
export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  interviewId: uuid("interview_id").references(() => interviews.id),
  aiQuestion: text("ai_question").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Answer Attempts
export const answerAttempts = pgTable("answer_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id").references(() => questions.id),
  userId: integer("user_id").references(() => users.id),
  code: text("code"),
  explanation: text("explanation").notNull(),
  aiFeedback: text("ai_feedback"),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recordings
export const recordings = pgTable("recordings", {
  id: uuid("id").defaultRandom().primaryKey(),
  interviewId: uuid("interview_id").references(() => interviews.id),
  videoUrl: text("video_url"),
  transcriptUrl: text("transcript_url"),
  createdAt: timestamp("created_at").defaultNow(),
});
