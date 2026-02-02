import { pgTable, text, timestamp, uuid, varchar, integer } from 'drizzle-orm/pg-core';

// Users - clerk_id is the primary key (permanent identifier from Clerk)
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // This IS the clerk_id
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  imageUrl: text('image_url'),
  authProvider: varchar('auth_provider', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastSignInAt: timestamp('last_sign_in_at'),
});

// Interviews
export const interviews = pgTable('interviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .references(() => users.id)
    .notNull(),
  domain: varchar('domain', { length: 50 }).notNull(),
  difficulty: varchar('difficulty', { length: 20 }).notNull(),
  duration: integer('duration').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  status: varchar('status', { length: 20 }).default('in_progress'),
  totalScore: integer('total_score'),
});

// Questions
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  interviewId: uuid('interview_id')
    .references(() => interviews.id)
    .notNull(),
  aiQuestion: text('ai_question').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Answer Attempts
export const answerAttempts = pgTable('answer_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id')
    .references(() => questions.id)
    .notNull(),
  userId: varchar('user_id', { length: 255 })
    .references(() => users.id)
    .notNull(),
  code: text('code'),
  explanation: text('explanation').notNull(),
  aiFeedback: text('ai_feedback'),
  score: integer('score'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Recordings
export const recordings = pgTable('recordings', {
  id: uuid('id').defaultRandom().primaryKey(),
  interviewId: uuid('interview_id')
    .references(() => interviews.id)
    .notNull(),
  videoUrl: text('video_url'),
  transcriptUrl: text('transcript_url'),
  recordingStatus: varchar('recording_status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});
