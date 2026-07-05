import { sql } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, varchar, uniqueIndex, index } from 'drizzle-orm/pg-core';

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
}, (table) => {
  return {
    activeIdx: uniqueIndex('interviews_one_active_per_user_idx')
      .on(table.userId)
      .where(sql`${table.status} = 'in_progress'`),
  };
});

// Question Bank
export const questionBank = pgTable('question_bank', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  domain: varchar('domain', { length: 20 }).notNull(),
  difficulty: varchar('difficulty', { length: 20 }).notNull(),
  difficultyScore: integer('difficulty_score').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  primaryTopic: varchar('primary_topic', { length: 100 }).notNull(),
  secondaryTopic: varchar('secondary_topic', { length: 100 }),
  description: text('description').notNull(),
  examples: jsonb('examples').notNull(),
  constraints: jsonb('constraints').notNull(),
  requiresCode: boolean('requires_code').default(true).notNull(),
  starterCode: jsonb('starter_code').notNull(),
  optimalSolution: jsonb('optimal_solution').notNull(),
  solutionExplanation: text('solution_explanation').notNull(),
  timeComplexity: text('time_complexity').notNull(),
  spaceComplexity: text('space_complexity').notNull(),
  hints: jsonb('hints').notNull(),
  followUpQuestions: jsonb('follow_up_questions').notNull(),
  interviewerNotes: text('interviewer_notes').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    domainDifficultyIdx: index('domain_difficulty_idx').on(table.domain, table.difficultyScore)
  };
});

export const questionBankTags = pgTable('question_bank_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionBankId: uuid('question_bank_id')
    .references(() => questionBank.id)
    .notNull(),
  tag: varchar('tag', { length: 100 }).notNull(),
});

// Questions assigned to interview sessions
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  interviewId: uuid('interview_id')
    .references(() => interviews.id)
    .notNull(),
  questionBankId: uuid('question_bank_id')
    .references(() => questionBank.id)
    .notNull(),
  position: integer('position').default(0).notNull(),
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
  language: varchar('language', { length: 50 }),
  explanation: text('explanation').notNull(),
  hintsUsed: integer('hints_used').default(0).notNull(),
  aiFeedback: text('ai_feedback'),
  evaluationResult: jsonb('evaluation_result'),
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
