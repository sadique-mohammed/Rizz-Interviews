export enum Domain {
  DSA = "DSA",
  WebDev = "Web Dev",
}

export enum Difficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
}

export enum Status {
  InProgress = "in_progress",
  Completed = "completed",
}

export interface Interview {
  id: string;
  userId: string;
  domain: Domain;
  difficulty: Difficulty;
  startedAt: string;
  endedAt: string | null; // null while in-progress
  duration: number; // in minutes
  totalScore: number | null; // null until completed
  status: Status;
}

export interface Question {
  id: string;
  interviewId: string;
  aiQuestion: string;
  createdAt: string;
}

export interface AnswerAttempt {
  id: string;
  questionId: string;
  userId: string;
  code?: string; // optional for theoretical questions
  explanation?: string;
  aiFeedback?: string;
  score: number | null; // null until AI scores
  createdAt: string;
}
